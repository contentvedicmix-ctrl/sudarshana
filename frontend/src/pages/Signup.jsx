import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(email, password, name);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#08090a" }}>
      <div className="w-full max-w-sm fade-in">
        <Link to="/" className="flex items-center gap-1.5 text-[13px] mb-8" style={{ color: "#62666d", fontWeight: 510 }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>

        <h1 className="text-[24px] mb-1" style={{
          color: "#f7f8f8",
          fontWeight: 400,
          letterSpacing: "-0.288px",
          fontFeatureSettings: '"cv01", "ss03"',
        }}>
          Create Account
        </h1>
        <p className="text-[14px] mb-6" style={{ color: "#8a8f98" }}>
          Start with 3 free mock interviews
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] block mb-1.5" style={{ color: "#d0d6e0", fontWeight: 400 }}>
              Name
            </label>
            <input
              type="text" required
              className="w-full text-[14px] rounded-md"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#d0d6e0",
                padding: "12px 14px",
                outline: "none",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = "#5e6ad2"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
          <div>
            <label className="text-[13px] block mb-1.5" style={{ color: "#d0d6e0", fontWeight: 400 }}>
              Email
            </label>
            <input
              type="email" required
              className="w-full text-[14px] rounded-md"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#d0d6e0",
                padding: "12px 14px",
                outline: "none",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = "#5e6ad2"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
          <div>
            <label className="text-[13px] block mb-1.5" style={{ color: "#d0d6e0", fontWeight: 400 }}>
              Password
            </label>
            <input
              type="password" required minLength={6}
              className="w-full text-[14px] rounded-md"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#d0d6e0",
                padding: "12px 14px",
                outline: "none",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = "#5e6ad2"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 text-[14px] rounded-md disabled:opacity-50"
            style={{
              background: "#5e6ad2",
              color: "#ffffff",
              fontWeight: 510,
            }}
          >
            {loading ? "Creating account..." : "Create Free Account"}
          </button>
        </form>
        <p className="text-[13px] text-center mt-5" style={{ color: "#62666d" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7170ff", fontWeight: 510 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
