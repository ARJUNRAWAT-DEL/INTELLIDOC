export default function Solutions() {
  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white font-display">Solutions</h1>
        <p className="mt-3 text-slate-300 text-lg">Persona-driven solutions: Legal, Healthcare, Developers — tailored for your needs.</p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-premium border border-slate-700 hover:border-blue-400/50 transition-all hover:shadow-premium-lg hover:-translate-y-1">
            <div className="text-xl font-bold text-white">Legal</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-premium border border-slate-700 hover:border-purple-400/50 transition-all hover:shadow-premium-lg hover:-translate-y-1">
            <div className="text-xl font-bold text-white">Healthcare</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-premium border border-slate-700 hover:border-cyan-400/50 transition-all hover:shadow-premium-lg hover:-translate-y-1">
            <div className="text-xl font-bold text-white">Developers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
