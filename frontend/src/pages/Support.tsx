export default function Support() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Support
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Fast help, clear status, and a professional support experience.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Need assistance? Use the options below to find documentation, raise
            a request, or check platform health before escalating.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Support channels</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                Email support for product questions and onboarding help.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                Admin console for visibility into users, documents, and system
                metrics.
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                Knowledge base for workflows, integrations, and common fixes.
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Response expectations</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>• Standard requests: 1 business day</p>
              <p>• Priority workspace issues: same-day review</p>
              <p>• Security-sensitive requests: fast escalation path</p>
              <p>• Status updates shown in-product where possible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
