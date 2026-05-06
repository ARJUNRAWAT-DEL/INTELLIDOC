import React from "react";

const AboutPersonal: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <main className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            About
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Product-minded engineer building AI tools that feel polished in real
            workflows.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            I focus on document intelligence, retrieval systems, and interfaces
            that help teams find answers without fighting the tool.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-2">
            <h2 className="text-2xl font-bold">What I build</h2>
            <p className="mt-4 text-slate-300">
              Systems that ingest documents, normalize data, and surface the
              right answer with context, source links, and clear feedback
              states.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
              {[
                "Semantic search experiences",
                "Admin dashboards",
                "Upload pipelines",
                "Model-backed summaries",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">Experience</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p>• FastAPI backend and database-driven features</p>
              <p>• React frontends with polished motion and layout</p>
              <p>• Retrieval, embeddings, and document pipelines</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPersonal;
