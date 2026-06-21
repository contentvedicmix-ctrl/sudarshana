import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "../api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe().then(setUser).catch(() => localStorage.removeItem("token"));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }

  return (
    <nav style={{
      background: "rgba(8,9,10,0.9)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-[15px]" style={{
          color: "#f7f8f8",
          fontWeight: 510,
          fontFeatureSettings: '"cv01", "ss03"',
        }}>
          InterviewCoach
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/pricing" className="text-[13px]" style={{ color: "#d0d6e0", fontWeight: 510 }}>
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-[13px]" style={{ color: "#d0d6e0", fontWeight: 510 }}>
                Dashboard
              </Link>
              <button
                onClick={() => navigate("/interview")}
                className="text-[13px] px-4 py-1.5 rounded-md"
                style={{ background: "#5e6ad2", color: "#ffffff", fontWeight: 510 }}
              >
                Practice Now
              </button>
              <button onClick={handleLogout} className="text-[13px]" style={{ color: "#62666d", fontWeight: 510 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[13px] px-4 py-1.5 rounded-md" style={{
                color: "#e2e4e7",
                fontWeight: 510,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgb(36, 40, 44)",
              }}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-[13px] px-4 py-1.5 rounded-md"
                style={{ background: "#5e6ad2", color: "#ffffff", fontWeight: 510 }}
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
