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
    <nav className="bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-lg flex items-center gap-2">
          <span className="text-2xl">🎤</span> InterviewCoach
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
              <Link to="/interview" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition font-medium">
                Practice Now
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition">Sign In</Link>
              <Link to="/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition font-medium">
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
