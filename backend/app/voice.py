"""
Voice pipeline: Whisper (STT) → OpenRouter (AI) → Edge TTS (voice out).

All free / open-source tools.
"""

import base64
import httpx
import json
import logging
import io
import random
from typing import Optional
from .config import settings

logger = logging.getLogger(__name__)

# ─── Domain-specific system prompts ───

DOMAIN_PROMPTS = {
    "tech": (
        "You are a senior technical interviewer at a top product company. "
        "Ask realistic coding, system design, and CS fundamentals questions. "
        "Evaluate answers strictly on technical accuracy, problem-solving approach, and communication."
    ),
    "banking": (
        "You are a banking sector interviewer. "
        "Ask about financial awareness, banking regulations, numerical ability, and customer service scenarios."
    ),
    "govt": (
        "You are a UPSC/state govt interview panel member. "
        "Ask about current affairs, general knowledge, ethics, and situation-based questions."
    ),
    "hr": (
        "You are an HR interviewer evaluating a candidate for a mid-level role. "
        "Ask behavioral questions: leadership, conflict resolution, strengths/weaknesses, career goals."
    ),
    "sales": (
        "You are a sales hiring manager. "
        "Ask about sales techniques, objection handling, target achievement, and client management."
    ),
    "general": (
        "You are a friendly but thorough interviewer conducting a general job interview. "
        "Mix behavioral, situational, and role-specific questions. Keep it realistic."
    ),
}

FREE_MODELS = [
    "openrouter/free",
]

BASE_URL = "https://openrouter.ai/api/v1"

# ─── Fallback questions when API unavailable ───

FALLBACK_FIRST_QUESTIONS = {
    "tech": "Tell me about a challenging technical project you've worked on. What was your role, what technologies did you use, and what was the outcome?",
    "banking": "Why are you interested in a career in banking, and what do you think are the most important skills for a successful banking professional?",
    "govt": "Why do you want to work in government service, and what do you understand about the role and responsibilities of a civil servant?",
    "hr": "Tell me about yourself. What experience do you have in human resources and what makes you a good fit for this role?",
    "sales": "What motivates you in a sales role, and how do you handle rejection when a potential client says no?",
    "general": "Tell me about yourself. Walk me through your background and what brings you here today.",
}

FALLBACK_FOLLOW_UPS = [
    "That's interesting. Can you tell me more about a specific challenge you faced and how you overcame it?",
    "What do you consider your biggest professional achievement so far?",
    "Where do you see yourself in five years, and how does this role align with that vision?",
    "Describe a time when you had to work under pressure. How did you handle it?",
    "What are your greatest strengths and areas for improvement?",
]

FALLBACK_FEEDBACKS = [
    "You provided a clear and structured response. Try to add more specific examples from your experience to make your answer more impactful.",
    "Good answer! You communicated your thoughts well. Consider quantifying your achievements to add more weight.",
    "Solid response. To improve, try connecting your answer directly to the job requirements and the company's mission.",
    "Well spoken! One area to work on: keep your answers concise and focused. Try the STAR method for behavioral questions.",
    "Good effort. Practice speaking at a steady pace and maintaining eye contact. Your content was relevant but could benefit from a stronger opening.",
]

_question_counter = 0

def _get_fallback_question(domain: str) -> str:
    global _question_counter
    q = FALLBACK_FIRST_QUESTIONS.get(domain, FALLBACK_FIRST_QUESTIONS["general"])
    f = FALLBACK_FOLLOW_UPS[_question_counter % len(FALLBACK_FOLLOW_UPS)]
    _question_counter += 1
    return f"{q}\n\nFollow-up: {f}"

def _get_fallback_feedback() -> str:
    return random.choice(FALLBACK_FEEDBACKS)

# ─── STT: Whisper via OpenRouter or direct ───

async def transcribe_audio(audio_base64: str) -> str:
    """
    Transcribe base64-encoded audio to text.
    Uses OpenRouter's Whisper endpoint (free).
    Falls back to a simple placeholder if unavailable.
    """
    try:
        audio_bytes = base64.b64decode(audio_base64)
        async with httpx.AsyncClient(timeout=30) as client:
            files = {"file": ("audio.webm", audio_bytes, "audio/webm")}
            headers = {"Authorization": f"Bearer {settings.openrouter_api_key}"}
            resp = await client.post(
                f"{BASE_URL}/audio/transcriptions",
                headers=headers,
                data={"model": "whisper-1"},
                files=files,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("text", "")
            else:
                logger.warning(f"Whisper API returned {resp.status_code}: {resp.text[:200]}")
                return ""
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return ""

# ─── AI Interview Logic via OpenRouter ───

async def generate_first_question(domain: str = "general") -> str:
    """Generate the first interview question."""
    prompt = DOMAIN_PROMPTS.get(domain, DOMAIN_PROMPTS["general"])
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": f"Ask the first interview question for a {domain} role. Start with an introduction request or a standard opener."}
    ]
    result = await _call_llm(messages)
    if result is None:
        logger.warning(f"OpenRouter unavailable for first question, using fallback for domain={domain}")
        result = FALLBACK_FIRST_QUESTIONS.get(domain, FALLBACK_FIRST_QUESTIONS["general"])
    return result

async def generate_follow_up(domain: str, question: str, answer: str, history: list) -> dict:
    """
    Given the question and user's answer, return:
      { "feedback": "...", "score": int (1-10), "next_question": "..." }
    """
    prompt = DOMAIN_PROMPTS.get(domain, DOMAIN_PROMPTS["general"])
    history_text = "\n".join([f"Q: {h['q']}\nA: {h['a']}" for h in history[-3:]]) if history else ""

    messages = [
        {"role": "system", "content": f"{prompt}\n\nYou must respond in valid JSON only with fields: feedback, score (1-10), next_question."},
        {"role": "user", "content": f"""Previous exchange:
{history_text}

The question you just asked was: {question}
The candidate answered: {answer}

Evaluate their answer. Give honest feedback, a score out of 10, and the next interview question. Make it realistic — like a real interview."""}
    ]

    result = await _call_llm(messages)

    # Try to parse JSON from the response
    if result is not None:
        try:
            # Find JSON in the response (it might have extra text)
            text = result
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(text[start:end])
                return {
                    "feedback": parsed.get("feedback", text),
                    "score": min(max(int(parsed.get("score", 5)), 1), 10),
                    "next_question": parsed.get("next_question", "Tell me about yourself."),
                }
        except (json.JSONDecodeError, ValueError, TypeError):
            pass

        # Fallback: return raw response with a default score
        return {
            "feedback": result,
            "score": 5,
            "next_question": "Tell me about a challenge you've faced and how you handled it.",
        }

    # API completely unavailable — use template fallbacks
    logger.warning("OpenRouter unavailable for follow-up, using fallback templates")
    return {
        "feedback": random.choice(FALLBACK_FEEDBACKS),
        "score": 5,
        "next_question": _get_fallback_question(domain),
    }

# ─── TTS: gTTS (Google Text-to-Speech, free) ───

async def text_to_speech_base64(text: str) -> str:
    """
    Convert text to speech using gTTS (Google Text-to-Speech, free).
    Returns base64-encoded MP3 audio.
    """
    try:
        from gtts import gTTS
        tts = gTTS(text=text, lang='hi' if any('\u0900' <= c <= '\u097f' for c in text) else 'en', slow=False)
        audio_bytes = io.BytesIO()
        tts.write_to_fp(audio_bytes)
        return base64.b64encode(audio_bytes.getvalue()).decode("utf-8")
    except ImportError:
        logger.warning("gtts not installed, returning empty audio")
        return ""
    except Exception as e:
        logger.error(f"TTS error: {e}")
        return ""

# ─── LLM Call Helper ───

async def _call_llm(messages: list) -> str:
    """Call OpenRouter with automatic fallback across free models."""
    last_error = None
    for model in FREE_MODELS:
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"{BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openrouter_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": 500,
                        "temperature": 0.7,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"Model {model} failed: {resp.status_code} {resp.text[:100]}")
                    last_error = f"{resp.status_code}: {resp.text[:100]}"
                    continue
        except Exception as e:
            logger.warning(f"Model {model} error: {e}")
            last_error = str(e)
            continue

    logger.error(f"All models failed. Last error: {last_error}")
    return None  # Caller should handle fallback
