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
    <div className="min-h-screen bg-gray-900 text-white px-4 py-16">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Simple Pricing</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Start free. Upgrade when you're ready for unlimited practice.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 border relative ${
              plan.popular
                ? "bg-indigo-900/30 border-indigo-500"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-xs px-4 py-1 rounded-full font-semibold">
                Most Popular
              </span>
            )}
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-gray-400 text-sm"> {plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span> {f}
                </li>
              ))}
            </ul>
            {plan.href === "#" ? (
              <button className="w-full py-2 rounded-lg font-semibold transition bg-gray-700 text-gray-400 cursor-not-allowed text-sm" disabled>
                Coming Soon
              </button>
            ) : (
              <Link
                to={plan.href}
                className={`block w-full text-center py-2 rounded-lg font-semibold transition text-sm ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mt-8">
        Payments via Razorpay (coming soon). For now, Pro & Lifetime are free during beta.
      </p>
    </div>
  );
}
