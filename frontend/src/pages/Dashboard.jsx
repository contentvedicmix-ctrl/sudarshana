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
      } catch (err) {
        // redirect handled by api interceptor
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFree = user?.subscription_tier === "free";
  const remaining = isFree ? (user?.free_tier_limit || 3) - (user?.interviews_this_month || 0) : "Unlimited";

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user?.name || "User"} 👋</h1>
            <p className="text-gray-400 text-sm">
              {isFree
                ? `${remaining} free interviews remaining this month`
                : "Pro subscriber — unlimited interviews"}
            </p>
          </div>
          <button
            onClick={() => navigate("/interview")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition text-sm"
          >
            + New Interview
          </button>
        </div>

        {/* Upgrade Card */}
        {isFree && remaining <= 1 && (
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 mb-8 border border-indigo-700">
            <h2 className="text-lg font-bold mb-1">Running low on free interviews</h2>
            <p className="text-gray-300 text-sm mb-3">Upgrade to Pro for unlimited mock interviews with all domains.</p>
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-2 bg-white text-indigo-900 font-semibold rounded-lg text-sm hover:bg-gray-100 transition"
            >
              See Plans
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Interviews" value={interviews.length} />
          <StatCard
            label="Avg Score"
            value={
              interviews.length > 0
                ? Math.round(
                    interviews.filter((i) => i.score).reduce((s, i) => s + i.score, 0) /
                      interviews.filter((i) => i.score).length * 10
                  ) / 10 || "-"
                : "-"
            }
          />
          <StatCard label="Completed" value={interviews.filter((i) => i.status === "completed").length} />
        </div>

        {/* History */}
        <h2 className="text-xl font-semibold mb-4">Past Interviews</h2>
        {interviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🎤</p>
            <p>No interviews yet. Start your first practice session!</p>
            <button
              onClick={() => navigate("/interview")}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((inv) => (
              <div
                key={inv.id}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium capitalize">{inv.domain}</p>
                  <p className="text-gray-400 text-xs">
                    {inv.status === "completed"
                      ? `${inv.question_count} questions · ${new Date(inv.started_at).toLocaleDateString("en-IN")}`
                      : "In progress"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {inv.score && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      inv.score >= 7 ? "bg-green-900 text-green-300" :
                      inv.score >= 4 ? "bg-yellow-900 text-yellow-300" :
                      "bg-red-900 text-red-300"
                    }`}>
                      {inv.score}/10
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded ${
                    inv.status === "completed" ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
