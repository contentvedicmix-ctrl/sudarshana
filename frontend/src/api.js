import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ───

export async function signup(email, password, name) {
  const res = await api.post("/auth/signup", { email, password, name });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data;
}

// ─── Interview ───

export async function startInterview(domain = "general") {
  const res = await api.post("/interview/start", { domain });
  return res.data;
}

export async function submitResponse(interviewId, audioBase64) {
  const res = await api.post("/interview/respond", {
    interview_id: interviewId,
    audio_base64: audioBase64,
  });
  return res.data;
}

export async function getInterviewHistory() {
  const res = await api.get("/interview/history");
  return res.data;
}

export async function getInterviewDetail(interviewId) {
  const res = await api.get(`/interview/${interviewId}`);
  return res.data;
}
