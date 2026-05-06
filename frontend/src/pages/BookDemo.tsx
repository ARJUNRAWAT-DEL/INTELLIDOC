export default function BookDemo() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-fuchsia-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Book a demo
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            See the platform in a guided session with your real use case.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            We’ll walk through upload, summarization, search, and admin
            visibility using a workflow that matches your team.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">What the demo covers</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-200">
              <p>• Real document upload and indexing flow</p>
              <p>• Search results with source references</p>
              <p>• Admin dashboard metrics and usage views</p>
              <p>• Q&A about permissions and deployment</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Ideal for</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
              {[
                "Teams evaluating document search",
                "Internal knowledge base rollouts",
                "Admin and support stakeholders",
                "Security or compliance reviews",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
