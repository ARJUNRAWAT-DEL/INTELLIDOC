import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "Upload Document",
      description:
        "Drag and drop PDFs, contracts, research papers, reports, or any document.",
      icon: "📄",
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "AI Processing",
      description:
        "IntelliDoc reads and extracts key information, clauses, deadlines, and important details.",
      icon: "⚡",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Summary Generated",
      description:
        "Get a clear, concise summary with important points highlighted and organized.",
      icon: "✨",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Ask Questions",
      description:
        "Chat with your document and get instant answers to any question you have.",
      icon: "💬",
      color: "from-green-500 to-teal-600",
    },
    {
      title: "AI Answers with Source",
      description:
        "Every answer includes the exact source from your document with page references.",
      icon: "🎯",
      color: "from-blue-500 to-indigo-600",
    },
  ];

  const features = [
    {
      num: "1",
      title: "Upload any document",
      desc: "PDFs, contracts, research papers, reports, and notes.",
    },
    {
      num: "2",
      title: "AI reads and understands",
      desc: "IntelliDoc extracts key points, clauses, deadlines, and important details.",
    },
    {
      num: "3",
      title: "Get source-backed summaries",
      desc: "Every answer includes where the information came from.",
    },
    {
      num: "4",
      title: "Ask questions",
      desc: "Chat with your document and get clear answers instantly.",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#01030a] pt-24 pb-16 px-6 lg:px-8">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black leading-[0.95] text-white mb-6">
            See IntelliDoc in Action
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Watch how our AI transforms complex documents into instant summaries
            and answers.
          </p>
        </div>

        {/* Mobile App Mockup - Animated */}
        <div className="flex justify-center mb-16">
          <div
            className="relative w-80 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-slate-900 bg-white"
            style={{
              perspective: "1000px",
              transform: "perspective(1000px) rotateY(-6deg)",
            }}
          >
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20" />

            {/* Status bar */}
            <div className="bg-slate-900 text-white px-6 py-2 flex justify-between items-center text-xs font-semibold pt-8">
              <span>9:41</span>
              <span>📶 📡 🔋</span>
            </div>

            {/* App header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4">
              <h2 className="font-bold text-lg">IntelliDoc</h2>
              <p className="text-xs text-cyan-100">AI Document Analysis</p>
            </div>

            {/* Content area - animated steps */}
            <div className="bg-slate-50 px-6 py-8 h-64 overflow-hidden relative">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-x-6 top-8 transition-all duration-700 ${
                    idx === currentStep
                      ? "opacity-100 translate-y-0"
                      : idx < currentStep
                        ? "opacity-0 -translate-y-full"
                        : "opacity-0 translate-y-full"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-3">{step.icon}</div>
                    <h3 className="font-bold text-slate-900 text-center text-sm mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 text-center leading-relaxed">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    {idx === 0 && currentStep === 0 && (
                      <div className="w-full mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 animate-[width_4s_ease-in-out]"
                          style={{ width: "100%" }}
                        />
                      </div>
                    )}

                    {/* Processing dots */}
                    {idx === 1 && currentStep === 1 && (
                      <div className="flex gap-1 mt-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    )}

                    {/* Summary bullets */}
                    {idx === 2 && currentStep === 2 && (
                      <div className="text-left w-full mt-3 space-y-1">
                        <div className="text-xs text-slate-600">
                          ✓ Key terms identified
                        </div>
                        <div className="text-xs text-slate-600">
                          ✓ Summary generated
                        </div>
                        <div className="text-xs text-slate-600">
                          ✓ Ready for questions
                        </div>
                      </div>
                    )}

                    {/* Chat bubble */}
                    {idx === 3 && currentStep === 3 && (
                      <div className="text-left w-full mt-3 space-y-2">
                        <div className="bg-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 max-w-[90%]">
                          What is the cancellation policy?
                        </div>
                        <div className="text-right">
                          <div className="bg-green-500 text-white rounded-lg px-3 py-2 text-xs inline-block max-w-[90%]">
                            Processing...
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Answer with source */}
                    {idx === 4 && currentStep === 4 && (
                      <div className="text-left w-full mt-3 space-y-2">
                        <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2 text-xs text-slate-900">
                          <p className="font-semibold mb-1">Answer:</p>
                          <p className="mb-2">Requires 14 days notice</p>
                          <p className="text-xs text-green-700 font-semibold">
                            📄 Source: Page 5
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Home indicator */}
            <div className="bg-slate-900 px-6 py-3 text-center">
              <div className="w-32 h-1 bg-white rounded-full mx-auto" />
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-3 mb-12">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                idx === currentStep
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </section>

      {/* Feature sections */}
      <section className="max-w-6xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-xl border border-slate-700 bg-slate-900/30 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all duration-300"
            >
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-600/10 transition-all duration-300 pointer-events-none" />

              <div className="relative">
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
                  {feature.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">
          Ready to transform your documents?
        </h2>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Start summarizing and asking questions about your documents in
          seconds. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/summarize")}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/40 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-2 justify-center">
              Start Free
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 text-slate-300 font-semibold border-2 border-slate-500 rounded-xl hover:border-slate-300 hover:bg-slate-900/30 hover:text-slate-100 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </section>
    </div>
  );
}

// Inline professional SVG (document-focused) used in right column
function DocumentHeroSVG() {
  return (
    <div className="w-full flex items-center justify-center">
      <svg
        viewBox="0 0 240 240"
        width="220"
        height="220"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <rect
          x="14"
          y="34"
          width="160"
          height="120"
          rx="12"
          fill="#F8FAFC"
          stroke="#E6EEF3"
        />
        <path
          d="M28 52h128"
          stroke="#CBD5E1"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M28 72h96"
          stroke="#94A3B8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <g transform="translate(120, 28)">
          <circle cx="48" cy="48" r="36" fill="url(#g1)" opacity="0.12" />
          <path
            d="M36 44h24M36 56h12"
            stroke="#0EA5A4"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="6"
            y="86"
            width="84"
            height="36"
            rx="6"
            fill="#fff"
            stroke="#E6EEF3"
          />
        </g>
        <g transform="translate(28, 160)">
          <rect
            x="0"
            y="0"
            width="184"
            height="40"
            rx="8"
            fill="#fff"
            stroke="#E6EEF3"
          />
          <path
            d="M12 12h60"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M12 26h100"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
