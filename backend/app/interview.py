from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from .database import supabase
from .models import InterviewStartRequest, InterviewResponseSubmit, AnswerResult, InterviewSummary
from .auth import get_current_user
from .voice import (
    transcribe_audio,
    generate_first_question,
    generate_follow_up,
    text_to_speech_base64,
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/interview", tags=["interview"])

# In-memory session store for active interviews (simple, no Redis needed for MVP)
# Key: interview_id, Value: { domain, questions_asked: [], answers: [] }
active_sessions: dict = {}

@router.post("/start")
async def start_interview(body: InterviewStartRequest, user: dict = Depends(get_current_user)):
    """Start a new mock interview session."""
    user_id = user["id"]

    # Check free tier limit
    tier = user.get("subscription_tier", "free")
    interviews_this_month = user.get("interviews_this_month", 0)
    free_limit = user.get("free_tier_limit", 3)

    if tier == "free" and interviews_this_month >= free_limit:
        raise HTTPException(status_code=402, detail="Free tier limit reached. Upgrade to Pro for unlimited interviews.")

    # Generate first question
    first_q = await generate_first_question(body.domain)

    # Create interview record
    result = supabase.table("interviews").insert({
        "user_id": user_id,
        "domain": body.domain,
        "status": "in_progress",
        "started_at": datetime.utcnow().isoformat(),
    }).execute()

    interview = result.data[0]
    interview_id = interview["id"]

    # Store session in memory
    active_sessions[interview_id] = {
        "domain": body.domain,
        "questions": [first_q],
        "answers": [],
    }

    # Increment counter
    supabase.table("users").update({
        "interviews_this_month": interviews_this_month + 1
    }).eq("id", user_id).execute()

    # Convert question to speech
    audio_b64 = await text_to_speech_base64(first_q)

    return {
        "interview_id": interview_id,
        "question": first_q,
        "question_audio_base64": audio_b64,
        "question_number": 1,
    }

@router.post("/respond", response_model=AnswerResult)
async def respond_to_question(body: InterviewResponseSubmit, user: dict = Depends(get_current_user)):
    """Submit an audio response, get AI feedback and next question."""
    interview_id = body.interview_id

    # Verify ownership
    interview = supabase.table("interviews").select("*").eq("id", interview_id).single().execute()
    if not interview.data:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.data["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview")
    if interview.data["status"] == "completed":
        raise HTTPException(status_code=400, detail="Interview already completed")

    session = active_sessions.get(interview_id)
    if not session:
        raise HTTPException(status_code=400, detail="Session expired. Start a new interview.")

    # 1. Transcribe audio
    user_text = await transcribe_audio(body.audio_base64)
    if not user_text:
        user_text = "[Could not transcribe audio]"

    # 2. Get last question asked
    last_question = session["questions"][-1]

    # 3. Generate AI feedback + next question
    result = await generate_follow_up(
        domain=session["domain"],
        question=last_question,
        answer=user_text,
        history=[
            {"q": q, "a": a}
            for q, a in zip(session["questions"][:-1], session["answers"])
        ],
    )

    feedback = result["feedback"]
    score = result["score"]
    next_question = result["next_question"]

    # 4. Track
    session["answers"].append(user_text)
    session["questions"].append(next_question)

    # 5. Convert AI response to speech
    ai_audio_b64 = await text_to_speech_base64(feedback)

    # 6. Save response to DB
    supabase.table("interview_responses").insert({
        "interview_id": interview_id,
        "ai_question": last_question,
        "user_response_text": user_text,
        "ai_response": feedback,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    # 7. If we've done 8+ questions, wrap up
    question_number = len(session["questions"])
    if question_number > 8:
        # Complete the interview
        total_score = score  # Simplified: last score stands in as overall
        supabase.table("interviews").update({
            "status": "completed",
            "score": total_score,
            "feedback": {"summary": feedback},
            "completed_at": datetime.utcnow().isoformat(),
        }).eq("id", interview_id).execute()

        del active_sessions[interview_id]

        return AnswerResult(
            user_text=user_text,
            ai_text=f"Thank you for completing the interview! Here's your feedback:\n\n{feedback}",
            ai_audio_base64=ai_audio_b64,
            score=score,
            next_question="[INTERVIEW_COMPLETE]",
        )

    # Convert next question to speech
    next_q_audio_b64 = await text_to_speech_base64(next_question)

    return AnswerResult(
        user_text=user_text,
        ai_text=feedback,
        ai_audio_base64=next_q_audio_b64,
        score=score,
        next_question=next_question,
    )

@router.get("/history")
async def get_history(user: dict = Depends(get_current_user)):
    """Get user's past interviews."""
    result = supabase.table("interviews").select("*")\
        .eq("user_id", user["id"])\
        .order("started_at", desc=True)\
        .limit(20)\
        .execute()

    summaries = []
    for inv in result.data:
        # Count responses
        resp_count = supabase.table("interview_responses")\
            .select("id", count="exact")\
            .eq("interview_id", inv["id"])\
            .execute()
        summaries.append(InterviewSummary(
            id=inv["id"],
            domain=inv["domain"],
            status=inv["status"],
            score=inv.get("score"),
            started_at=inv["started_at"],
            completed_at=inv.get("completed_at"),
            question_count=resp_count.count if resp_count.count else 0,
        ))

    return {"interviews": summaries}

@router.get("/{interview_id}")
async def get_interview_detail(interview_id: str, user: dict = Depends(get_current_user)):
    """Get full transcript of a past interview."""
    interview = supabase.table("interviews").select("*").eq("id", interview_id).single().execute()
    if not interview.data:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.data["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your interview")

    responses = supabase.table("interview_responses")\
        .select("*")\
        .eq("interview_id", interview_id)\
        .order("created_at")\
        .execute()

    return {
        "interview": interview.data,
        "responses": responses.data,
    }
