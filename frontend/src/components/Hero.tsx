import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import MobileMockup from "./MobileMockup";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen w-full flex items-center pt-32 md:pt-24 lg:pt-20 pb-12 md:pb-16 lg:pb-20 px-6 lg:px-8 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.7)]" />
              AI-Powered Intelligence
            </div>

            <div>
              <h1
                className="font-display font-black leading-[0.95] text-white mb-8 max-w-[760px]"
                style={{ fontSize: "clamp(56px, 6vw, 96px)" }}
              >
                <span className="block">Understand Any</span>
                <span className="block mt-2">Document with</span>
                <span className="block mt-2">
                  <span className="relative inline-flex items-center">
                    <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.16),transparent_65%)] blur-2xl opacity-30 -z-10" />
                    <span className="relative bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                      AI
                    </span>
                  </span>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed font-light mt-6">
                Upload PDFs, contracts, research papers, and reports. Get clear
                summaries, answers, and citations in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <button
                onClick={() => navigate("/summarize")}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/40 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Start Summarizing</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform relative"
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
              </button>

              <Link
                to="/how-it-works"
                className="group px-6 py-4 text-slate-300 font-semibold border-2 border-slate-500 rounded-xl hover:border-slate-300 hover:bg-slate-900/30 hover:text-slate-100 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
              >
                View Demo →
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-8 border-t border-slate-700/50">
              {[
                { num: "10K+", label: "Docs Processed" },
                { num: "98%", label: "Accuracy" },
                { num: "<2s", label: "Processing" },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {stat.num}
                  </div>
                  <p className="text-xs md:text-sm text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div
              className="relative w-full flex justify-center"
              style={{ perspective: "1000px" }}
            >
              <div
                style={{ transform: "perspective(1000px) rotateY(-6deg)" }}
                className="transition-transform duration-300"
              >
                <MobileMockup className="shadow-[0_40px_100px_rgba(0,0,0,0.7)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
