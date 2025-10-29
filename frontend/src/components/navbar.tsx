import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('intellidoc_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'intellidoc_user') {
        try { setUser(ev.newValue ? JSON.parse(ev.newValue) : null); } catch (e) { setUser(null); }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const logout = () => {
    try { ApiService.logout(); } catch (e) { /* ignore */ }
    try { localStorage.removeItem('intellidoc_user'); } catch (e) { /* ignore */ }
    setUser(null);
    navigate('/');
  };

  return (
    // Disable the backdrop blur on small screens (it creates a large fuzzy area when the
    // page background is visible). Keep blur on larger screens for the polished look.
    <header className="sticky top-0 z-50 backdrop-blur-none sm:backdrop-blur bg-white/60 shadow-sm border-b">
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

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-slate-700 hover:text-slate-900">Home</Link>
          <Link to="/how-it-works" className="text-sm text-slate-700 hover:text-slate-900">How it works</Link>
          <Link to="/solutions" className="text-sm text-slate-700 hover:text-slate-900">Product</Link>
          <Link to="/pricing" className="text-sm text-slate-700 hover:text-slate-900">Pricing</Link>
          <Link to="/docs" className="text-sm text-slate-700 hover:text-slate-900">Docs & API</Link>
          <Link to="/resources" className="text-sm text-slate-700 hover:text-slate-900">Resources</Link>
          <Link to="/support" className="text-sm text-slate-700 hover:text-slate-900">Support</Link>
          <Link to="/personal/contact" className="text-sm text-slate-700 hover:text-slate-900">Contact</Link>

          <div className="ml-4 flex items-center gap-3">
            {!user ? (
              <Link to="/login" className="text-sm text-slate-700 hover:text-slate-900 border border-gray-100 px-3 py-1.5 rounded-md enter-slide-up">Log in</Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 border border-gray-100 px-3 py-1.5 rounded-md bg-white"
                  aria-expanded={userMenuOpen}
                >
                  <span className="text-sm">{user.name ?? user.email}</span>
                  <svg className="w-4 h-4 text-slate-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-md shadow-sm z-50">
                    <Link to="/personal" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">Profile</Link>
                    <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">Log out</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-md border border-gray-100 bg-white/70"
          >
            <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <path d="M4 6h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel — always mounted so we can animate. Non-focusable when closed. */}
      <div
        className={`md:hidden bg-white/95 border-t border-gray-100 transform origin-top transition-all duration-300 ease-in-out motion-reduce:transition-none ${open ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-0 opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
          <Link to="/" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Home</Link>
          <Link to="/how-it-works" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">How it works</Link>
          <Link to="/solutions" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Product</Link>
          <Link to="/pricing" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Pricing</Link>
          <Link to="/docs" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Docs & API</Link>
          <Link to="/resources" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Resources</Link>
          <Link to="/support" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Support</Link>
          <Link to="/personal/contact" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700">Contact</Link>

            <div className="mt-2 flex flex-col gap-2">
            {!user ? (
              <Link to="/login" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} aria-hidden={!open} className="text-sm text-slate-700 border border-gray-100 px-3 py-2 rounded-md enter-slide-up">Log in</Link>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="px-3 py-2 text-sm text-slate-700">{user.name ?? user.email}</div>
                <button onClick={() => { setOpen(false); logout(); }} className="text-sm text-slate-700 text-left px-3 py-2">Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
