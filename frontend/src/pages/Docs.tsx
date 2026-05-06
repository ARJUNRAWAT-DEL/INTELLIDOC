export default function Docs() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Docs & API
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            A developer-friendly API with a quick start that gets you moving
            fast.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Use the upload, search, and onboarding endpoints to embed IntelliDoc
            into internal tools or customer-facing workflows.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Quickstart</h2>
            <div className="mt-5 rounded-2xl bg-slate-950/70 border border-white/10 p-5 text-sm text-cyan-100 overflow-auto">
              <pre className="whitespace-pre-wrap leading-6">{`POST /auth/login
POST /upload
GET /documents
POST /search
GET /admin/statistics/overview`}</pre>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Use bearer tokens for authenticated actions and admin headers for
              dashboard operations.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-cyan-400/10 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">API principles</h2>
            <div className="mt-6 space-y-4 text-slate-200 text-sm">
              <p>• Keep request payloads small and explicit.</p>
              <p>• Return source references with every answer.</p>
              <p>• Preserve admin visibility for audits and support.</p>
              <p>• Normalize emails and document metadata consistently.</p>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Auth",
              text: "Email/password login, Google OAuth, and session persistence.",
            },
            {
              title: "Search",
              text: "Semantic search with filtering, source selection, and progress states.",
            },
            {
              title: "Admin",
              text: "Database-backed user and statistics views for portal operations.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
