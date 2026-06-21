import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, getInterviewHistory } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userData, historyData] = await Promise.all([
          getMe(),
          getInterviewHistory(),
        ]);
        setUser(userData);
        setInterviews(historyData.interviews || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#08090a" }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{
          borderColor: "rgba(255,255,255,0.1)",
          borderTopColor: "#5e6ad2",
        }}></div>
      </div>
    );
  }

  const isFree = user?.subscription_tier === "free";
  const remaining = isFree ? (user?.free_tier_limit || 3) - (user?.interviews_this_month || 0) : null;
  const completed = interviews.filter((i) => i.status === "completed").length;
  const avgScore =
    interviews.filter((i) => i.score).length > 0
      ? Math.round(
          interviews.filter((i) => i.score).reduce((s, i) => s + i.score, 0) /
            interviews.filter((i) => i.score).length
        )
      : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#08090a" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-[15px]" style={{
            color: "#f7f8f8",
            fontWeight: 510,
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            InterviewCoach
          </button>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-[13px]" style={{ color: "#8a8f98", fontWeight: 400 }}>
                {user.name || user.email}
              </span>
            )}
            <button
              onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
              className="text-[13px] px-3 py-1.5 rounded-md"
              style={{
                color: "#62666d",
                fontWeight: 510,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgb(36, 40, 44)",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Welcome row + CTA */}
        <div className="flex items-center justify-between mb-10 fade-in">
          <div>
            <h1 className="text-[24px] mb-1" style={{
              color: "#f7f8f8",
              fontWeight: 400,
              letterSpacing: "-0.288px",
              fontFeatureSettings: '"cv01", "ss03"',
            }}>
              Hello, {user?.name || "User"}
            </h1>
            <p className="text-[14px]" style={{ color: "#8a8f98" }}>
              {isFree
                ? `${remaining} free interviews remaining this month`
                : "Pro subscriber — unlimited interviews"}
            </p>
          </div>
          <button
            onClick={() => navigate("/interview")}
            className="px-5 py-2.5 text-[14px] rounded-md"
            style={{
              background: "#5e6ad2",
              color: "#ffffff",
              fontWeight: 510,
            }}
          >
            + New Interview
          </button>
        </div>

        {/* Upgrade card */}
        {isFree && remaining !== null && remaining <= 1 && remaining >= 0 && (
          <div className="p-5 rounded-lg mb-8 fade-in" style={{
            background: "rgba(94,106,210,0.08)",
            border: "1px solid rgba(94,106,210,0.2)",
          }}>
            <p className="text-[15px] mb-1" style={{ color: "#f7f8f8", fontWeight: 510 }}>
              Running low on free interviews
            </p>
            <p className="text-[13px] mb-3" style={{ color: "#8a8f98" }}>
              Upgrade to Pro for unlimited mock interviews with all domains.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-1.5 text-[13px] rounded-md"
              style={{
                background: "#5e6ad2",
                color: "#ffffff",
                fontWeight: 510,
              }}
            >
              See Plans
            </button>
          </div>
        )}

        {/* Completion row */}
        {remaining === 0 && isFree && (
          <div className="p-5 rounded-lg mb-8 fade-in" style={{
            background: "rgba(229,72,77,0.08)",
            border: "1px solid rgba(229,72,77,0.2)",
          }}>
            <p className="text-[15px] mb-1" style={{ color: "#f7f8f8", fontWeight: 510 }}>
              You've used all your free interviews
            </p>
            <p className="text-[13px] mb-3" style={{ color: "#8a8f98" }}>
              Upgrade to Pro to continue practicing, or they reset next month.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-1.5 text-[13px] rounded-md"
              style={{
                background: "#5e6ad2",
                color: "#ffffff",
                fontWeight: 510,
              }}
            >
              Upgrade
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10 fade-in" style={{ animationDelay: "0.1s" }}>
          <StatCard label="Interviews" value={interviews.length} />
          <StatCard label="Avg Score" value={avgScore !== null ? `${avgScore}/10` : "—"} />
          <StatCard label="Completed" value={completed} />
        </div>

        {/* History */}
        <div className="fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-[17px] mb-4" style={{
            color: "#f7f8f8",
            fontWeight: 590,
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            Past Interviews
          </h2>
          {interviews.length === 0 ? (
            <div className="py-16 text-center rounded-lg" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div className="text-3xl mb-3 opacity-40">🎤</div>
              <p className="text-[14px] mb-4" style={{ color: "#8a8f98" }}>
                No interviews yet. Start your first practice session!
              </p>
              <button
                onClick={() => navigate("/interview")}
                className="px-5 py-2 text-[14px] rounded-md"
                style={{
                  background: "#5e6ad2",
                  color: "#ffffff",
                  fontWeight: 510,
                }}
              >
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {interviews.map((inv, i) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 px-4 rounded-md"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    animation: `fade-in 0.3s ease-out ${0.2 + i * 0.04}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div>
                    <p className="text-[14px]" style={{ color: "#f7f8f8", fontWeight: 510 }}>
                      {inv.domain.charAt(0).toUpperCase() + inv.domain.slice(1)}
                    </p>
                    <p className="text-[12px]" style={{ color: "#62666d" }}>
                      {inv.status === "completed"
                        ? `${inv.question_count || 0} questions · ${new Date(inv.started_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                        : "In progress"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.score && (
                      <span className="text-[12px] px-2 py-0.5 rounded-full" style={{
                        color: inv.score >= 7 ? "#27a644" : inv.score >= 4 ? "#dfab01" : "#e5484d",
                        background: inv.score >= 7 ? "rgba(39,166,68,0.12)" : inv.score >= 4 ? "rgba(223,171,1,0.12)" : "rgba(229,72,77,0.12)",
                        fontWeight: 510,
                      }}>
                        {inv.score}/10
                      </span>
                    )}
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{
                      color: inv.status === "completed" ? "#27a644" : "#8a8f98",
                      background: inv.status === "completed" ? "rgba(39,166,68,0.1)" : "rgba(255,255,255,0.04)",
                      fontWeight: 510,
                    }}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="text-center p-5 rounded-lg" style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <p className="text-[28px] mb-1" style={{
        color: "#f7f8f8",
        fontWeight: 510,
        fontFeatureSettings: '"cv01", "ss03"',
      }}>
        {value}
      </p>
      <p className="text-[12px]" style={{ color: "#62666d", fontWeight: 400 }}>{label}</p>
    </div>
  );
}
