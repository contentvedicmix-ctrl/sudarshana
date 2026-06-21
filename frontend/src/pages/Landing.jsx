import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Mic,
  Sparkles,
  TrendingUp,
  Briefcase,
  IndianRupee,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react";

// ─── Reusable Component: Glow Card ───
function FeatureCard({ icon: Icon, title, description, index, badge, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative rounded-2xl p-6 sm:p-7 transition-all duration-500"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.08), transparent 60%)",
        }}
      />

      {/* Border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "0 0 30px rgba(99,102,241,0.06)",
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))",
            border: "1px solid rgba(99,102,241,0.12)",
          }}
        >
          <Icon className="w-5 h-5" style={{ color: "#818cf8" }} strokeWidth={1.5} />
        </div>

        {/* Badge */}
        {badge && (
          <span
            className="inline-block text-[11px] px-2.5 py-1 rounded-full mb-3"
            style={{
              background: "rgba(99,102,241,0.1)",
              color: "#a5b4fc",
              letterSpacing: "0.02em",
              fontWeight: 510,
            }}
          >
            {badge}
          </span>
        )}

        {/* Title */}
        <h3
          className="text-[17px] mb-2"
          style={{
            color: "#f7f8f8",
            fontWeight: 590,
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-[14px] leading-relaxed" style={{ color: "#8a8f98", fontWeight: 400 }}>
          {description}
        </p>

        {/* Children (domain tags, etc.) */}
        {children}
      </div>
    </motion.div>
  );
}

// ─── Reusable: Button ───
function Button({ children, variant = "primary", href, onClick, className = "", icon: Icon }) {
  const isLink = href && !onClick;
  const Tag = isLink ? Link : "button";
  const props = isLink ? { to: href } : { onClick };

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 22px",
    fontSize: "14px",
    fontWeight: 510,
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
    border: "none",
    lineHeight: 1.4,
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "#ffffff",
      boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
    },
    secondary: {
      background: "rgba(255,255,255,0.03)",
      color: "#e2e4e7",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    ghost: {
      background: "transparent",
      color: "#8a8f98",
    },
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ display: "inline-flex" }}
    >
      <Tag
        {...props}
        className={className}
        style={{ ...baseStyle, ...variants[variant] }}
        onMouseEnter={(e) => {
          if (variant === "secondary")
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          if (variant === "secondary")
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }}
      >
        {children}
        {Icon && <Icon className="w-4 h-4" strokeWidth={2} />}
      </Tag>
    </motion.div>
  );
}

// ─── Domain Tags ───
const domains = ["Tech", "Banking", "Government", "Sales", "HR"];

// ─── Main Landing Component ───
export default function Landing() {
  // Scroll-driven hero opacity
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Mouse glow tracker for cards
  useEffect(() => {
    const handleMouse = (e) => {
      document.querySelectorAll(".group").forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div style={{ backgroundColor: "#050505", minHeight: "100vh", overflow: "hidden" }}>

      {/* ─── SEO Meta ─── */}
      <Helmet>
        <title>InterviewCoach — AI-Powered Mock Interviews | Free Voice Practice</title>
        <meta name="description" content="Ace your next interview with AI-powered voice practice. Get real feedback, detailed scoring, and progress tracking. Built for Indian job seekers." />
        <meta name="keywords" content="mock interview, AI interview coach, interview practice, job preparation, India" />
        <meta property="og:title" content="InterviewCoach — AI-Powered Mock Interviews" />
        <meta property="og:description" content="Practice with AI-powered mock interviews. Voice-based, zero pressure, anytime." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://interviewcoach.app" />
      </Helmet>

      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(5,5,5,0.8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-[16px]" style={{
            color: "#f7f8f8",
            fontWeight: 590,
            fontFeatureSettings: '"cv01", "ss03"',
            letterSpacing: "-0.3px",
          }}>
            InterviewCoach
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-8">
            <Link
              to="/pricing"
              className="text-[13px] transition-colors duration-200"
              style={{ color: "#8a8f98", fontWeight: 510 }}
              onMouseEnter={(e) => (e.target.style.color = "#e2e4e7")}
              onMouseLeave={(e) => (e.target.style.color = "#8a8f98")}
            >
              Pricing
            </Link>
            <Link
              to="/login"
              className="text-[13px] transition-colors duration-200"
              style={{ color: "#8a8f98", fontWeight: 510 }}
              onMouseEnter={(e) => (e.target.style.color = "#e2e4e7")}
              onMouseLeave={(e) => (e.target.style.color = "#8a8f98")}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-[13px] px-5 py-2 rounded-lg transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#ffffff",
                fontWeight: 510,
                boxShadow: "0 4px 20px rgba(99,102,241,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 30px rgba(99,102,241,0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-3">
            <Link
              to="/signup"
              className="text-[12px] px-4 py-1.5 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#ffffff",
                fontWeight: 510,
              }}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── HERO SECTION ─── */}
      <motion.section style={{ opacity: heroOpacity }} className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-5 sm:px-8">
        {/* Background gradient orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 30%, transparent 60%)",
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(168,85,247,0.04) 0%, transparent 50%)",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.12)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#a5b4fc" }} strokeWidth={1.5} />
            <span className="text-[12px]" style={{ color: "#a5b4fc", fontWeight: 510 }}>
              AI-powered mock interviews — free to start
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[42px] sm:text-[56px] md:text-[68px] lg:text-[76px] leading-[1.05] sm:leading-[1.05] mb-5"
            style={{
              fontWeight: 400,
              letterSpacing: "-2.5px",
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            <span style={{ color: "#f7f8f8" }}>Ace Your Next </span>
            <span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c4b5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Interview
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[17px] sm:text-[19px] leading-relaxed max-w-xl mx-auto mb-8"
            style={{ color: "#8a8f98", fontWeight: 400 }}
          >
            Practice with AI-powered mock interviews.
            <br />
            Get real feedback on your answers.
            <br />
            Voice-based, zero pressure, anytime.
            <br />
            Built for Indian job seekers.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button href="/signup" icon={ArrowRight}>
              Start Free
            </Button>
            <Button href="/pricing" variant="secondary">
              See Plans
            </Button>
          </motion.div>

          {/* Trust indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-[12px] mt-6"
            style={{ color: "#5a5d63" }}
          >
            No credit card required · 3 free mock interviews
          </motion.p>
        </div>
      </motion.section>

      {/* ─── FEATURES GRID ─── */}
      <section className="px-5 sm:px-8 pb-24">
        <div className="max-w-6xl mx-auto">

          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center mb-12"
          >
            <span
              className="inline-block text-[12px] px-3 py-1 rounded-full mb-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "#8a8f98",
                fontWeight: 510,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Everything you need
            </span>
            <h2
              className="text-[28px] sm:text-[34px]"
              style={{
                color: "#f7f8f8",
                fontWeight: 400,
                letterSpacing: "-0.9px",
                fontFeatureSettings: '"cv01", "ss03"',
              }}
            >
              Why choose{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                InterviewCoach
              </span>
            </h2>
          </motion.div>

          {/* 6-card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1 */}
            <FeatureCard
              icon={Mic}
              title="Voice-Based Practice"
              description="Real interview conversation. Speak naturally. No typing."
              index={0}
              badge="Real Voice"
            />
            {/* Card 2 */}
            <FeatureCard
              icon={Sparkles}
              title="AI That Actually Helps"
              description="Detailed scoring. Actionable feedback. Progress tracking."
              index={1}
              badge="AI Powered"
            />
            {/* Card 3 */}
            <FeatureCard
              icon={TrendingUp}
              title="Track Improvement"
              description="Monitor scores across sessions. Visual performance dashboard."
              index={2}
            />
            {/* Card 4 */}
            <FeatureCard
              icon={Briefcase}
              title="Any Domain"
              description="Practice for any role with domain-specific questions."
              index={3}
            >
              <div className="flex flex-wrap gap-1.5 mt-4">
                {domains.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] px-2.5 py-1 rounded-md"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#8a8f98",
                      fontWeight: 510,
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </FeatureCard>
            {/* Card 5 */}
            <FeatureCard
              icon={IndianRupee}
              title="Built for India"
              description="Questions tailored to Indian interviews. Affordable pricing starting at ₹0."
              index={4}
            />
            {/* Card 6 */}
            <FeatureCard
              icon={Smartphone}
              title="Works on Phone"
              description="No app installation needed. Works directly in your browser. Chrome, Safari & more."
              index={5}
            />
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)",
        }} />
      </div>

      {/* ─── CTA SECTION ─── */}
      <section className="px-5 sm:px-8 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 30%, transparent 60%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10"
          >
            {/* Star decoration */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              <Star className="w-6 h-6" style={{ color: "#818cf8" }} strokeWidth={1.5} />
            </div>

            <h2
              className="text-[32px] sm:text-[42px] mb-4"
              style={{
                color: "#f7f8f8",
                fontWeight: 400,
                letterSpacing: "-1.1px",
                fontFeatureSettings: '"cv01", "ss03"',
              }}
            >
              Ready to practice?
            </h2>
            <p className="text-[17px] mb-8" style={{ color: "#8a8f98" }}>
              3 free mock interviews. No credit card required.
            </p>
            <Button href="/signup" icon={ChevronRight}>
              Create Free Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="px-5 sm:px-8 py-10"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px]" style={{ color: "#5a5d63", fontWeight: 400 }}>
            Built for Indian students who want to succeed.
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="#"
              className="text-[12px] transition-colors duration-200"
              style={{ color: "#5a5d63", fontWeight: 510 }}
              onMouseEnter={(e) => (e.target.style.color = "#8a8f98")}
              onMouseLeave={(e) => (e.target.style.color = "#5a5d63")}
            >
              Privacy
            </Link>
            <Link
              to="#"
              className="text-[12px] transition-colors duration-200"
              style={{ color: "#5a5d63", fontWeight: 510 }}
              onMouseEnter={(e) => (e.target.style.color = "#8a8f98")}
              onMouseLeave={(e) => (e.target.style.color = "#5a5d63")}
            >
              Terms
            </Link>
            <Link
              to="#"
              className="text-[12px] transition-colors duration-200"
              style={{ color: "#5a5d63", fontWeight: 510 }}
              onMouseEnter={(e) => (e.target.style.color = "#8a8f98")}
              onMouseLeave={(e) => (e.target.style.color = "#5a5d63")}
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Inline Helmet component (lightweight) ───
function Helmet({ children }) {
  useEffect(() => {
    const tags = [];
    children.forEach((child) => {
      if (child.type === "title") {
        document.title = child.props.children;
      } else if (child.type === "meta") {
        const el = document.createElement("meta");
        Object.entries(child.props).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
        tags.push(el);
      } else if (child.type === "link") {
        const el = document.createElement("link");
        Object.entries(child.props).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
        tags.push(el);
      }
    });
    return () => tags.forEach((el) => el.remove());
  }, []);
  return null;
}
