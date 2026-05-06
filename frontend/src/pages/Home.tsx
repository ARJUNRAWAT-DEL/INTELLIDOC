import Hero from "../components/Hero";
import CosmicBackdrop from "../components/CosmicBackdrop";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <CosmicBackdrop />

      <div className="relative w-full z-10">
        <Hero />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pb-12 z-10 space-y-12">
        <div className="space-y-12">
          <section className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload Document",
                description:
                  "Securely add PDFs, contracts, reports, and research papers in one place.",
              },
              {
                step: "2",
                title: "AI Reads & Understands",
                description:
                  "Natural language comprehension extracts meaning, structure, and insights.",
              },
              {
                step: "3",
                title: "Get Source-Backed Summary",
                description:
                  "Receive precise summaries backed by citations and key takeaways.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-white/10 bg-[#06131F]/85 p-6 shadow-lg shadow-cyan-500/5"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 font-semibold">
                    {item.step}
                  </div>
                  <div className="h-2.5 w-16 rounded-full bg-cyan-400/20" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#06131F]/95 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
            <div className="flex flex-wrap items-center gap-3">
              {[
                "PDFs",
                "Research Papers",
                "Contracts",
                "Reports",
                "Invoices",
                "Legal Docs",
                "Academic Notes",
              ].map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                >
                  {type}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              Core capabilities for precise document intelligence
            </h2>
            <p className="text-base md:text-lg text-slate-300">
              IntelliDoc combines cutting-edge NLP, document processing, and
              semantic search to deliver accurate, contextual insights from any
              document.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "✨",
                title: "Multi-Format Support",
                description:
                  "Process PDFs, Word docs, research papers, and more with intelligent format detection.",
              },
              {
                icon: "🔍",
                title: "Source-Backed Search",
                description:
                  "Every answer is connected to exact source locations, so you can verify claims instantly.",
              },
              {
                icon: "⚡",
                title: "Sub-Second Processing",
                description:
                  "Advanced indexing and caching deliver results in under 2 seconds for most documents.",
              },
              {
                icon: "🧠",
                title: "Context-Aware Summaries",
                description:
                  "AI understands document structure, relationships, and nuance for intelligent summaries.",
              },
              {
                icon: "🔐",
                title: "Enterprise Security",
                description:
                  "Your data stays private. End-to-end encryption and zero-knowledge architecture.",
              },
              {
                icon: "📊",
                title: "Admin Dashboard",
                description:
                  "Track usage, manage uploads, monitor AI health from a polished control panel.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-3xl border border-white/10 bg-[#050A16]/95 p-6 shadow-lg shadow-slate-950/20 hover:shadow-[0_30px_80px_rgba(56,189,248,0.08)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="absolute inset-x-3 top-3 h-16 rounded-3xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-violet-500/0 opacity-0 group-hover:opacity-100 blur-2xl" />
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className="border-t border-white/10 pt-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { number: "10K+", label: "Documents Processed" },
              { number: "98%", label: "Accuracy Rate" },
              { number: "<2s", label: "Avg Processing" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <p className="mt-2 text-xs md:text-sm text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
