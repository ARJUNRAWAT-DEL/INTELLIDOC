export default function Pricing() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white font-display">Pricing</h1>
        <p className="mt-3 text-slate-300 text-lg">Simple plans for teams. Monthly and annual billing toggle coming soon.</p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-premium border border-slate-700 hover:border-slate-600 transition-all hover:shadow-premium-lg hover:-translate-y-1">
            <div className="text-xl font-bold text-white">Free</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-premium border border-slate-700 hover:border-slate-600 transition-all hover:shadow-premium-lg hover:-translate-y-1">
            <div className="text-xl font-bold text-white">Team</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-premium border border-slate-700 hover:border-slate-600 transition-all hover:shadow-premium-lg hover:-translate-y-1">
            <div className="text-xl font-bold text-white">Enterprise</div>
          </div>
        </div>
      </div>
    </div>
  );
}
