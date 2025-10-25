import React from "react";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-800">IntelliDoc</div>
            <div className="text-xs text-slate-500">Document Intelligence • Semantic Search</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm text-slate-600 hover:text-slate-900">Docs</a>
          <a href="#" className="text-sm text-slate-600 hover:text-slate-900">API</a>
          <a href="#" className="text-sm text-slate-600 hover:text-slate-900">Pricing</a>
          <button className="ml-4 inline-flex items-center px-3 py-1.5 bg-slate-800 text-white text-sm rounded-md hover:bg-slate-900">
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}
