export default function Pricing() {
  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="max-w-3xl">
          <p className="text-cyan-200/80 text-sm font-semibold uppercase tracking-[0.3em]">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold leading-tight">
            Transparent plans for teams that want secure, fast document
            intelligence.
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Every plan includes source-backed summaries, semantic search, and
            the polished UI your users expect. Scale from a single workspace to
            a full internal knowledge platform.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Starter",
              price: "Free",
              desc: "For pilots, demos, and personal use.",
              features: [
                "5 documents",
                "Core summaries",
                "Search and upload",
                "Community support",
              ],
            },
            {
              name: "Team",
              price: "$19",
              desc: "For small groups collaborating on documents.",
              features: [
                "Unlimited uploads",
                "Shared workspaces",
                "Priority indexing",
                "Usage insights",
              ],
            },
            {
              name: "Enterprise",
              price: "Custom",
              desc: "For regulated teams needing control.",
              features: [
                "SSO-ready architecture",
                "Admin analytics",
                "Audit trails",
                "Dedicated support",
              ],
            },
          ].map((plan, index) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 backdrop-blur-xl shadow-2xl ${index === 1 ? "border-cyan-300/40 bg-white/10" : "border-white/10 bg-white/5"}`}
            >
              <div className="text-sm uppercase tracking-[0.28em] text-slate-400">
                {plan.name}
              </div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-5xl font-black">{plan.price}</div>
                {index !== 2 && (
                  <span className="pb-1 text-slate-400">/month</span>
                )}
              </div>
              <p className="mt-4 text-slate-300">{plan.desc}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.6)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full rounded-full px-5 py-3 font-semibold ${index === 1 ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white border border-white/15"}`}
              >
                {index === 2 ? "Talk to sales" : "Start here"}
              </button>
            </div>
          ))}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold">What every plan includes</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-200">
              {[
                "Secure file upload",
                "Summary with source links",
                "Document search",
                "Responsive dashboard",
                "Admin-ready UI",
                "Mobile-friendly layouts",
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
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-500/10 p-8 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
              Why teams choose IntelliDoc
            </p>
            <p className="mt-4 text-lg text-slate-200">
              It turns unstructured files into a searchable knowledge system
              with a premium interface that feels built, not assembled.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p>• Less time searching through PDFs</p>
              <p>• Clearer onboarding for new users</p>
              <p>• Admin visibility for growth and support teams</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
