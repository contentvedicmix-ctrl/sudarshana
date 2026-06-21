from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .auth import router as auth_router
from .interview import router as interview_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Interview Coach", version="0.1.0")

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.site_url, "http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(interview_router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
