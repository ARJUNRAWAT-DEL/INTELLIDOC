export default function Resources() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-fuchsia-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Resources
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Guides, examples, and launch assets for teams adopting IntelliDoc.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            These are the practical building blocks: onboarding guidance, case
            studies, and best practices that help teams ship faster.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Getting started",
              text: "Set up your workspace, upload files, and make your first search in minutes.",
            },
            {
              title: "Team playbook",
              text: "A practical guide for training users and naming document collections.",
            },
            {
              title: "Case studies",
              text: "See how legal, finance, and ops teams save time with source-backed answers.",
            },
            {
              title: "Launch checklist",
              text: "A rollout checklist for admins, support, and stakeholders.",
            },
            {
              title: "Security notes",
              text: "Recommended practices for access control and sensitive documents.",
            },
            {
              title: "Templates",
              text: "Reusable prompts and query templates for common document tasks.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl"
            >
              <h2 className="text-xl font-bold">{card.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
