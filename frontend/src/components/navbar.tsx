export default function Navbar() {
  return (
    <header
      className="w-full bg-cover bg-center relative border-b"
      style={{ backgroundImage: "url('/pexels-starry-sky-1906658.jpg')" }}
    >
      {/* overlay to keep content readable */}
      <div className="absolute inset-0 bg-slate-900/45" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">IntelliDoc</div>
            <div className="text-xs text-sky-100/80">Document Intelligence • Semantic Search</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm text-sky-100/80 hover:text-white">Docs</a>
          <a href="#" className="text-sm text-sky-100/80 hover:text-white">API</a>
          <a href="#" className="text-sm text-sky-100/80 hover:text-white">Pricing</a>
          <button className="ml-4 inline-flex items-center px-3 py-1.5 bg-white/10 text-white text-sm rounded-md hover:bg-white/20">
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}
