import Hero from '../components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden">
      {/* Premium decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left gradient blob */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-indigo-600/20 rounded-full blur-3xl animate-blob"></div>
        
        {/* Top-right gradient blob */}
        <div className="absolute -top-20 -right-40 w-96 h-96 bg-gradient-to-bl from-purple-600/20 to-pink-600/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Bottom center gradient blob */}
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-600/20 to-blue-600/15 rounded-full blur-3xl animate-blob animation-delay-1000"></div>
        
        {/* Grid overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-950/10"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-8 pb-8 z-10">
        <Hero />
      </div>
    </div>
  );
}
