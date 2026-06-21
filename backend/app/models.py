from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth ---

class UserSignup(BaseModel):
    email: str
    password: str
    name: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    subscription_tier: str
    interviews_this_month: int
    free_tier_limit: int

# --- Interview ---

class InterviewStartRequest(BaseModel):
    domain: str = "general"

class InterviewResponseSubmit(BaseModel):
    interview_id: str
    audio_base64: str  # base64-encoded WebM/opus audio

class AnswerResult(BaseModel):
    user_text: str
    ai_text: str
    ai_audio_base64: str
    score: int
    next_question: str

class InterviewSummary(BaseModel):
    id: str
    domain: str
    status: str
    score: Optional[int]
    started_at: str
    completed_at: Optional[str]
    question_count: int
