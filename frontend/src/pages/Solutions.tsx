export default function Solutions() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-fuchsia-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Solutions
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Built for legal, operations, finance, and technical teams.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Each persona gets its own workflow, question presets, and result
            style so the experience feels tailored from the first click.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Legal",
              accent: "from-cyan-400 to-blue-500",
              items: [
                "Contract summaries",
                "Clause extraction",
                "Renewal risk review",
              ],
            },
            {
              title: "Finance",
              accent: "from-fuchsia-400 to-rose-500",
              items: [
                "Invoice review",
                "Policy lookup",
                "Audit-friendly answers",
              ],
            },
            {
              title: "Operations",
              accent: "from-emerald-400 to-teal-500",
              items: [
                "SLA summaries",
                "Process playbooks",
                "Status-ready insights",
              ],
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
            >
              <div
                className={`inline-flex rounded-full bg-gradient-to-r ${item.accent} px-4 py-1 text-xs font-bold uppercase tracking-[0.28em] text-slate-950`}
              >
                {item.title}
              </div>
              <h2 className="mt-5 text-2xl font-bold">
                Persona-specific experiences
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {item.items.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-white/80" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/50 to-cyan-950/40 p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">How teams use IntelliDoc</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-200">
            {[
              "Upload a document",
              "Choose a persona or question style",
              "Review source-backed results",
              "Share or export the answer",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  0{index + 1}
                </div>
                <p className="mt-2">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
