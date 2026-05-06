export default function Dashboard() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Your document workspace, summary metrics, and next actions in one
            place.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            This page can surface upload status, recent activity, saved
            searches, and recommended actions based on usage patterns.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Documents", value: "12" },
            { label: "Queries today", value: "34" },
            { label: "Saved views", value: "7" },
            { label: "Index status", value: "Healthy" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl"
            >
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">
                {stat.label}
              </div>
              <div className="mt-3 text-3xl font-black">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Recent activity</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-200">
              <p>• Uploaded 3 PDFs to the finance workspace.</p>
              <p>• Ran a summary query against the legal folder.</p>
              <p>• Shared a result with the team and opened an admin report.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-cyan-400/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Recommended next steps</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>• Add a few more documents to improve search coverage.</p>
              <p>• Create a persona preset for your most common workflow.</p>
              <p>• Review analytics to see which collections get used most.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
