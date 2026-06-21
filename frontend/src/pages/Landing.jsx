import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Ace Your Next Interview
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Practice with AI-powered mock interviews. Get real feedback. Improve with every session.
          Voice-based, zero pressure, anytime.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-lg transition">
            Start Free
          </Link>
          <Link to="/pricing" className="px-8 py-3 border border-gray-500 hover:border-white rounded-lg font-semibold text-lg transition">
            See Plans
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🎤"
            title="Voice-Based Practice"
            desc="Real interview conversation. Speak your answers, get voice feedback. No typing."
          />
          <FeatureCard
            icon="🤖"
            title="AI That Actually Helps"
            desc="Smart evaluation with honest feedback. Scores, suggestions, tracks your progress."
          />
          <FeatureCard
            icon="📊"
            title="Track Improvement"
            desc="Dashboard shows your scores over time. See yourself getting better."
          />
          <FeatureCard
            icon="🎯"
            title="Any Domain"
            desc="Tech, banking, government, sales, HR — tailored questions for your field."
          />
          <FeatureCard
            icon="🇮🇳"
            title="Built for India"
            desc="Questions match Indian interview patterns. Affordable pricing for students."
          />
          <FeatureCard
            icon="📱"
            title="Works on Phone"
            desc="Open in browser, tap record, start practicing. No app install needed."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to practice?</h2>
        <p className="text-gray-400 mb-6">3 free mock interviews. No credit card required.</p>
        <Link to="/signup" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-lg transition">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        Built with zero capital. For Indian students who want to succeed.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:border-indigo-500/50 transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
