import Hero from '../components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-primary via-navy-secondary to-navy-tertiary relative overflow-hidden">
      {/* Premium decorative background elements - Midnight Neon style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left gradient blob - Neon Purple */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent-neon-purple/30 to-accent-purple-alt/20 rounded-full blur-3xl animate-blob"></div>
        
        {/* Top-right gradient blob - Neon Cyan */}
        <div className="absolute -top-20 -right-40 w-96 h-96 bg-gradient-to-bl from-accent-neon-cyan/25 to-accent-neon-purple/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Bottom center gradient blob - Neon Cyan */}
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-gradient-to-tr from-accent-neon-cyan/20 to-accent-neon-purple/15 rounded-full blur-3xl animate-blob animation-delay-1000"></div>
        
        {/* Grid overlay for sophistication */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-secondary/5 to-navy-primary/10"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-8 pb-8 z-10">
        <Hero />
      </div>
    </div>
  );
}
