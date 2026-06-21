# AI Interview Coach 🎤

Voice-based AI mock interview platform for Indian students & freshers.

Built with zero capital using free tools. Powering your job preparation.

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Free, fast, works on mobile/desktop |
| Backend | FastAPI (Python) | Simple, async, perfect for AI pipelines |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth |
| STT | Whisper (via OpenRouter) | Free speech-to-text |
| AI | OpenRouter free models (Mistral 7B, Gemma 2, Phi-3, Llama 3) | Free LLM inference |
| TTS | Edge TTS (Microsoft) | Free, neural-quality voice |
| Hosting | Vercel (frontend) + Railway (backend) | Free tiers |
| Domain | ~₹800/year | Only real cost |

## Setup

### 1. Prerequisites

- Python 3.11+
- Node.js 18+

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows git-bash
pip install -r requirements.txt
```

Create `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=a-long-random-string
OPENROUTER_API_KEY=sk-or-v1-your-key
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
```

### 4. Database Setup

In Supabase SQL Editor, run:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  interviews_this_month INT DEFAULT 0,
  free_tier_limit INT DEFAULT 3
);

CREATE TABLE interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  score INT,
  feedback JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) NOT NULL,
  user_response_text TEXT,
  ai_question TEXT NOT NULL,
  ai_response TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_user ON interviews(user_id);
CREATE INDEX idx_responses_interview ON interview_responses(interview_id);
```

### 5. OpenRouter Setup

1. Go to [openrouter.ai](https://openrouter.ai) → Sign up
2. Go to Keys → Create API key
3. Add to `backend/.env` as `OPENROUTER_API_KEY`

Free models available:
- `mistralai/mistral-7b-instruct:free`
- `google/gemma-2-9b-it:free`
- `microsoft/phi-3-mini-4k-instruct:free`
- `meta-llama/llama-3-8b-instruct:free`

## Project Structure

```
ai-interview-coach/
├── backend/
│   ├── app/
│   │   ├── __init__.py     # FastAPI app, routes
│   │   ├── config.py       # Settings from .env
│   │   ├── database.py     # Supabase client
│   │   ├── models.py       # Pydantic schemas
│   │   ├── auth.py         # Signup, login, JWT
│   │   ├── interview.py    # Start, respond, history
│   │   └── voice.py        # Whisper + OpenRouter + Edge TTS
│   ├── main.py             # Entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js          # Axios + JWT interceptor
│   │   ├── App.jsx         # Routes
│   │   ├── index.css       # Tailwind + base styles
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Marketing page
│   │   │   ├── Login.jsx       # Sign in
│   │   │   ├── Signup.jsx      # Register
│   │   │   ├── Interview.jsx   # Interview room (core)
│   │   │   ├── Dashboard.jsx   # History + stats
│   │   │   └── Pricing.jsx     # Plans
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## How It Works

1. User signs up → JWT token stored in browser
2. User selects interview domain (tech, banking, govt, etc.)
3. AI asks a realistic interview question
4. User records answer via browser mic (MediaRecorder API)
5. Audio transcribed via Whisper (free)
6. AI evaluates answer + produces feedback + next question via OpenRouter free models
7. AI response converted to speech via Edge TTS
8. Repeat for 8 questions → final score shown
9. Dashboard tracks history and scores

## Pricing (coming via Razorpay)

| Plan | Price | Features |
|---|---|---|
| Free | ₹0 | 3 interviews/month |
| Pro | ₹299/mo | Unlimited |
| Lifetime | ₹2,999 | Forever access |

## Getting First Users

1. Share on WhatsApp groups (friends, college groups)
2. Post on Instagram / YouTube Shorts
3. Pitch to college placement cells
4. Let the free tier drive word-of-mouth

---

Built with ❤️ by Suraj + Hermes Agent. Zero capital, all free tools.
