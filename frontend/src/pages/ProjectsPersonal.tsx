import React from "react";
// Navbar and Footer are rendered globally in the app shell

const projects = [
  {
    id: 1,
    title: "IntelliDoc",
    desc: "Document summarization and semantic search platform.",
  },
  {
    id: 2,
    title: "Project Atlas",
    desc: "Knowledge graph toolkit for enterprise data.",
  },
  {
    id: 3,
    title: "CLI Tools",
    desc: "Developer productivity CLIs and utilities.",
  },
];

const ProjectsPersonal: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <main className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Projects
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            A showcase of practical, polished product work.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Each project card now carries more context so the page feels like a
            real portfolio instead of a stub.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl"
            >
              <div className="text-lg font-bold">{p.title}</div>
              <div className="mt-3 text-sm text-slate-300">{p.desc}</div>
              <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-400">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Design
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Build
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">Ship</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPersonal;
