import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview, submitResponse } from "../api";

const DOMAINS = [
  { value: "general", label: "General", desc: "Common HR & behavioral questions" },
  { value: "tech", label: "Tech / IT", desc: "Software, coding & system design" },
  { value: "banking", label: "Banking / Finance", desc: "Financial services & accounting" },
  { value: "govt", label: "Government / UPSC", desc: "Civil services & public sector" },
  { value: "sales", label: "Sales / Marketing", desc: "Sales strategies & market analysis" },
  { value: "hr", label: "HR / Management", desc: "Human resources & leadership" },
];

export default function Interview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("select-domain");
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

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {});
    }
  }, [audioUrl]);

  async function handleStartInterview() {
    setError("");
    try {
      const data = await startInterview(domain);
      setInterviewId(data.interview_id);
      setQuestion(data.question);
      setQuestionNumber(data.question_number);
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
        const base64 = reader.result.split(",")[1];
        const data = await submitResponse(interviewId, base64);
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
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  }

  // ─── Phase: Select Domain ───
  if (phase === "select-domain") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#08090a" }}>
        <div className="w-full max-w-md fade-in">
          {/* Back link */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-[13px] mb-8"
            style={{ color: "#62666d", fontWeight: 510 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-[24px] mb-1" style={{
            color: "#f7f8f8",
            fontWeight: 400,
            letterSpacing: "-0.288px",
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            New Mock Interview
          </h1>
          <p className="text-[14px] mb-6" style={{ color: "#8a8f98" }}>
            Choose your interview domain
          </p>

          {error && (
            <div className="p-3 rounded-md mb-5 text-[13px]" style={{
              color: "#e5484d",
              background: "rgba(229,72,77,0.1)",
              border: "1px solid rgba(229,72,77,0.2)",
            }}>
              {error}
            </div>
          )}

          <div className="space-y-2 mb-6">
            {DOMAINS.map((d) => (
              <button
                key={d.value}
                className="w-full text-left p-4 rounded-lg transition-all"
                style={{
                  background: domain === d.value ? "rgba(94,106,210,0.1)" : "rgba(255,255,255,0.02)",
                  border: domain === d.value
                    ? "1px solid rgba(94,106,210,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: domain === d.value ? "#f7f8f8" : "#d0d6e0",
                }}
                onClick={() => setDomain(d.value)}
              >
                <span className="text-[14px]" style={{ fontWeight: 510 }}>
                  {d.label}
                </span>
                <span className="block text-[12px] mt-0.5" style={{ color: "#8a8f98", fontWeight: 400 }}>
                  {d.desc}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleStartInterview}
            className="w-full py-3 text-[14px] rounded-md"
            style={{
              background: "#5e6ad2",
              color: "#ffffff",
              fontWeight: 510,
            }}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // ─── Phase: Interview ───
  if (phase === "interview") {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-8" style={{ backgroundColor: "#08090a" }}>
        <div className="w-full max-w-lg fade-in">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-[13px]"
              style={{ color: "#62666d", fontWeight: 510 }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Exit
            </button>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: i < questionNumber ? "#5e6ad2" : "rgba(255,255,255,0.15)",
                  transition: "background-color 0.3s ease",
                }} />
              ))}
            </div>
            <span className="text-[12px]" style={{ color: "#62666d", fontWeight: 510 }}>
              {questionNumber}/8
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-md mb-5 text-[13px]" style={{
              color: "#e5484d",
              background: "rgba(229,72,77,0.1)",
              border: "1px solid rgba(229,72,77,0.2)",
            }}>
              {error}
            </div>
          )}

          {/* Question card */}
          <div className="p-6 rounded-lg mb-8" style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <p className="text-[11px] mb-2" style={{
              color: "#7170ff",
              fontWeight: 510,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Question {questionNumber}
            </p>
            <p className="text-[17px] leading-relaxed" style={{
              color: "#f7f8f8",
              fontWeight: 400,
              fontFeatureSettings: '"cv01", "ss03"',
            }}>
              {question}
            </p>
          </div>

          {/* Recording controls */}
          <div className="text-center mb-8">
            {!isRecording && !isProcessing && (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "#5e6ad2",
                    color: "#ffffff",
                  }}
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-12 0v1.5a6 6 0 006 6m0 0v3.75m0-3.75h.008v.008H12v-.008z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
                  </svg>
                </button>
                <p className="text-[13px]" style={{ color: "#62666d" }}>Tap the mic to answer</p>
              </div>
            )}

            {isRecording && (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full flex items-center justify-center recording-pulse"
                  style={{ background: "#e5484d", color: "#ffffff" }}
                >
                  <div className="w-3.5 h-3.5" style={{ backgroundColor: "#ffffff", borderRadius: 2 }}></div>
                </button>
                <p className="text-[13px]" style={{ color: "#e5484d", fontWeight: 510 }}>
                  Recording... tap to stop
                </p>
                {/* Sound wave visualization */}
                <div className="flex items-center gap-[2px] h-6">
                  {[1,2,3,4,5,4,3,2,1,2,3,4,5,4,3,2,1,2,3,4].map((h, i) => (
                    <div key={i} className="w-[2px] rounded-full" style={{
                      height: `${h * 5}px`,
                      backgroundColor: "#e5484d",
                      opacity: 0.5 + (i % 3) * 0.2,
                      animation: `pulse 0.6s ease-out ${i * 0.05}s infinite alternate`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    borderTopColor: "#5e6ad2",
                  }}></div>
                </div>
                <p className="text-[13px]" style={{ color: "#62666d" }}>Analyzing your answer...</p>
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="p-5 rounded-lg fade-in" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px]" style={{ color: "#f7f8f8", fontWeight: 590 }}>
                  Feedback
                </p>
                {score !== null && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full" style={{
                    color: score >= 7 ? "#27a644" : score >= 4 ? "#dfab01" : "#e5484d",
                    background: score >= 7 ? "rgba(39,166,68,0.12)" : score >= 4 ? "rgba(223,171,1,0.12)" : "rgba(229,72,77,0.12)",
                    fontWeight: 510,
                  }}>
                    {score}/10
                  </span>
                )}
              </div>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "#8a8f98", fontWeight: 400 }}>
                {feedback}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Phase: Complete ───
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#08090a" }}>
      <div className="w-full max-w-sm text-center fade-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{
          background: "rgba(94,106,210,0.15)",
        }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#7170ff" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-[24px] mb-1" style={{
          color: "#f7f8f8",
          fontWeight: 400,
          letterSpacing: "-0.288px",
          fontFeatureSettings: '"cv01", "ss03"',
        }}>
          Interview Complete
        </h1>
        {totalScore !== null && (
          <div className="mb-8 mt-6">
            <p className="text-[12px] mb-1" style={{ color: "#62666d", fontWeight: 510, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Overall Score
            </p>
            <p className="text-[48px]" style={{
              color: totalScore >= 7 ? "#27a644" : totalScore >= 4 ? "#dfab01" : "#e5484d",
              fontWeight: 510,
              fontFeatureSettings: '"cv01", "ss03"',
              letterSpacing: "-1.056px",
            }}>
              {totalScore}/10
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 text-[14px] rounded-md"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgb(36, 40, 44)",
              color: "#e2e4e7",
              fontWeight: 510,
            }}
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
            className="px-5 py-2.5 text-[14px] rounded-md"
            style={{
              background: "#5e6ad2",
              color: "#ffffff",
              fontWeight: 510,
            }}
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}
