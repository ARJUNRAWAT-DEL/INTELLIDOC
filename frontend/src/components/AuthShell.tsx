import React from "react";
import CosmicBackdrop from "./CosmicBackdrop";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  asideTitle: string;
  asideText: string;
  asidePoints: string[];
};

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  asideTitle,
  asideText,
  asidePoints,
}: AuthShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden text-white">
      <CosmicBackdrop />
      <div className="absolute inset-0 bg-[#05070D]/90 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
              {eyebrow}
            </div>

            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-tight">
                {title}
              </h1>
              <p className="text-lg md:text-xl text-slate-200/80 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Secure", value: "Hashing + sessions" },
                { label: "Fast", value: "Low-friction sign-in" },
                { label: "Polished", value: "Cosmic motion + glass UI" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl"
                >
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {card.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-cyan-400/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-2xl shadow-2xl overflow-hidden">
              <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                <div className="text-sm uppercase tracking-[0.28em] text-cyan-100/70">
                  {asideTitle}
                </div>
                <p className="mt-2 text-sm text-slate-200/75">{asideText}</p>
              </div>
              <div className="px-6 py-5 space-y-3">
                {asidePoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-200/90"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
