import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "3 mock interviews / month",
      "All domains",
      "Voice-based practice",
      "AI feedback & scoring",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    features: [
      "Unlimited mock interviews",
      "All domains (tech, banking, govt, etc.)",
      "Voice-based practice",
      "Detailed AI feedback & scoring",
      "Interview history & progress tracking",
      "Priority support",
    ],
    cta: "Subscribe",
    href: "#",
    popular: true,
  },
  {
    name: "Lifetime",
    price: "₹2,999",
    period: "one-time",
    features: [
      "Everything in Pro",
      "Forever access",
      "No monthly bills",
      "All future features",
      "Founder badge",
    ],
    cta: "Get Lifetime",
    href: "#",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#08090a" }}>
      {/* Simple nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-[15px]" style={{
            color: "#f7f8f8",
            fontWeight: 510,
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            InterviewCoach
          </Link>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-[13px] px-4 py-1.5 rounded-md" style={{
              color: "#e2e4e7",
              fontWeight: 510,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgb(36, 40, 44)",
            }}>
              Sign In
            </Link>
            <Link to="/signup" className="text-[13px] px-4 py-1.5 rounded-md" style={{
              background: "#5e6ad2",
              color: "#ffffff",
              fontWeight: 510,
            }}>
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12 fade-in">
          <h1 className="text-[32px] mb-3" style={{
            color: "#f7f8f8",
            fontWeight: 400,
            letterSpacing: "-0.704px",
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            Simple Pricing
          </h1>
          <p className="text-[15px]" style={{ color: "#8a8f98" }}>
            Start free. Upgrade when you're ready for unlimited practice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 fade-in" style={{ animationDelay: "0.1s" }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="p-6 rounded-lg relative flex flex-col"
              style={{
                background: plan.popular ? "rgba(94,106,210,0.06)" : "rgba(255,255,255,0.02)",
                border: plan.popular
                  ? "1px solid rgba(94,106,210,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {plan.popular && (
                <span className="text-[11px] px-3 py-1 rounded-full mx-auto mb-4" style={{
                  background: "rgba(94,106,210,0.15)",
                  color: "#7170ff",
                  fontWeight: 510,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  Most Popular
                </span>
              )}
              <h2 className="text-[17px] mb-1" style={{ color: "#f7f8f8", fontWeight: 590 }}>
                {plan.name}
              </h2>
              <div className="mb-5">
                <span className="text-[36px]" style={{
                  color: "#f7f8f8",
                  fontWeight: 510,
                  fontFeatureSettings: '"cv01", "ss03"',
                  letterSpacing: "-0.792px",
                }}>
                  {plan.price}
                </span>
                <span className="text-[13px]" style={{ color: "#62666d" }}> {plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                      style={{ color: "#27a644" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-[14px]" style={{ color: "#d0d6e0" }}>{f}</span>
                  </li>
                ))}
              </ul>
              {plan.href === "#" ? (
                <button
                  className="w-full py-2.5 text-[14px] rounded-md cursor-not-allowed"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgb(36, 40, 44)",
                    color: "#62666d",
                    fontWeight: 510,
                  }}
                  disabled
                >
                  Coming Soon
                </button>
              ) : (
                <Link
                  to={plan.href}
                  className="block w-full text-center py-2.5 text-[14px] rounded-md"
                  style={{
                    background: "#5e6ad2",
                    color: "#ffffff",
                    fontWeight: 510,
                  }}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-[13px] mt-8" style={{ color: "#62666d" }}>
          Payments via Razorpay (coming soon). For now, Pro & Lifetime are free during beta.
        </p>
      </div>
    </div>
  );
}
