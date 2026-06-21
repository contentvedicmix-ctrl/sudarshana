import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview, submitResponse } from "../api";

const DOMAINS = [
  { value: "general", label: "General" },
  { value: "tech", label: "Tech / IT" },
  { value: "banking", label: "Banking / Finance" },
  { value: "govt", label: "Government / UPSC" },
  { value: "sales", label: "Sales / Marketing" },
  { value: "hr", label: "HR / Management" },
];

export default function Interview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("select-domain"); // select-domain | interview | complete
  const [domain, setDomain] = useState("general");
  const [interviewId, setInterviewId] = useState(null);
  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [totalScore, setTotalScore] = useState(null);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Play audio when AI response arrives
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {}); // autoplay might be blocked
    }
  }, [audioUrl]);

  async function handleStartInterview() {
    setError("");
    try {
      const data = await startInterview(domain);
      setInterviewId(data.interview_id);
      setQuestion(data.question);
      setQuestionNumber(data.question_number);
      // Convert base64 audio to blob URL
      if (data.question_audio_base64) {
        const blob = base64ToBlob(data.question_audio_base64, "audio/mp3");
        setAudioUrl(URL.createObjectURL(blob));
      }
      setPhase("interview");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to start interview");
    }
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        await sendAudio(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }

  async function sendAudio(blob) {
    setFeedback("");
    setScore(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(",")[1]; // remove data:audio/webm;base64, prefix
        const data = await submitResponse(interviewId, base64);

        // Convert AI audio base64 to blob URL
        if (data.ai_audio_base64) {
          const blob = base64ToBlob(data.ai_audio_base64, "audio/mp3");
          setAudioUrl(URL.createObjectURL(blob));
        }

        setFeedback(data.ai_text);
        setScore(data.score);

        if (data.next_question === "[INTERVIEW_COMPLETE]") {
          setTotalScore(data.score);
          setPhase("complete");
        } else {
          setQuestion(data.next_question);
          setQuestionNumber((n) => n + 1);
        }
        setIsProcessing(false);
      };
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process response");
      setIsProcessing(false);
    }
  }

  function base64ToBlob(base64, mimeType) {
    const byteChars = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteChars.length; offset += 512) {
      const slice = byteChars.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  }

  // ─── Select Domain Phase ───

  if (phase === "select-domain") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700">
          <h1 className="text-2xl font-bold text-white mb-2">New Mock Interview</h1>
          <p className="text-gray-400 mb-6">Choose your interview domain</p>
          {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</p>}
          <div className="space-y-2 mb-6">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  domain === d.value
                    ? "bg-indigo-600 border-indigo-400 text-white"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
                onClick={() => setDomain(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleStartInterview}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // ─── Interview Phase ───

  if (phase === "interview") {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white transition">
              ← Back
            </button>
            <span className="text-gray-400 text-sm">
              Question {questionNumber} of 8
            </span>
          </div>

          {/* Error */}
          {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</p>}

          {/* Question Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Question {questionNumber}</p>
            <p className="text-white text-lg">{question}</p>
          </div>

          {/* Recording Controls */}
          <div className="text-center mb-6">
            {!isRecording && !isProcessing && (
              <button
                onClick={startRecording}
                className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center mx-auto transition hover:scale-105 active:scale-95"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z"/>
                  <path d="M17 11a1 1 0 00-2 0 3 3 0 01-6 0 1 1 0 00-2 0 5 5 0 004 4.9V18H9a1 1 0 000 2h6a1 1 0 000-2h-2v-2.1A5 5 0 0017 11z"/>
                </svg>
              </button>
            )}

            {isRecording && (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center mx-auto transition animate-pulse"
                >
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </button>
                <p className="text-red-400 animate-pulse">Recording... tap to stop</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-400">Analyzing your answer...</p>
              </div>
            )}

            {!isRecording && !isProcessing && (
              <p className="text-gray-400 text-sm mt-3">Tap the mic to answer</p>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Feedback</h3>
                {score && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    score >= 7 ? "bg-green-900 text-green-300" :
                    score >= 4 ? "bg-yellow-900 text-yellow-300" :
                    "bg-red-900 text-red-300"
                  }`}>
                    Score: {score}/10
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{feedback}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Complete Phase ───

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Interview Complete!</h1>
        {totalScore && (
          <div className="mb-6">
            <p className="text-gray-400 mb-1">Your Overall Score</p>
            <p className={`text-5xl font-bold ${
              totalScore >= 7 ? "text-green-400" :
              totalScore >= 4 ? "text-yellow-400" : "text-red-400"
            }`}>
              {totalScore}/10
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            View Dashboard
          </button>
          <button
            onClick={() => {
              setPhase("select-domain");
              setFeedback("");
              setScore(null);
              setTotalScore(null);
              setError("");
              setAudioUrl("");
            }}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}
