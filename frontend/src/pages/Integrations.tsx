export default function Integrations() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-fuchsia-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Integrations
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Connect the workspace to the tools your team already uses.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            IntelliDoc is designed to fit into existing workflows, not replace
            them. Connect docs, chat, and dashboards in one flow.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Google Drive",
            "Slack",
            "Microsoft 365",
            "Custom API",
            "Webhooks",
            "CRM sync",
            "Email ingest",
            "Internal portals",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl shadow-2xl"
            >
              <div className="text-lg font-semibold">{item}</div>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold">Integration blueprint</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-200">
            {[
              "Authenticate and normalize your users.",
              "Push documents into the ingestion flow.",
              "Return answers and alerts into the tools people already use.",
            ].map((step) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
              >
                {step}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
