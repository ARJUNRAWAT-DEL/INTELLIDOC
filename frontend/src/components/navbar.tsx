import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ApiService } from '../services/api';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
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

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const logout = () => {
    try { ApiService.logout(); } catch (e) { /* ignore */ }
    try { localStorage.removeItem('intellidoc_user'); } catch (e) { /* ignore */ }
    setUser(null);
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'backdrop-blur-xl bg-navy-primary/60 border-b border-accent-neon-purple/10 shadow-lg' 
        : 'backdrop-blur-md bg-navy-primary/30 border-b border-navy-secondary/20'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <motion.div 
          className="flex items-center gap-3 hover-lift"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-accent-neon-purple to-accent-neon-cyan flex items-center justify-center shadow-lg shadow-accent-neon-purple/40 transform hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold text-white font-display">IntelliDoc</div>
            <div className="text-xs font-medium text-text-muted">AI Document Intelligence</div>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { to: '/', label: 'Home' },
            { to: '/how-it-works', label: 'How it works' },
            { to: '/solutions', label: 'Product' },
            { to: '/pricing', label: 'Pricing' },
            { to: '/docs', label: 'Docs & API' },
            { to: '/resources', label: 'Resources' },
            { to: '/support', label: 'Support' },
            { to: '/personal/contact', label: 'Contact' },
          ].map((item) => (
            <motion.div key={item.to} whileHover={{ scale: 1.05 }}>
              <Link
                to={item.to}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-white rounded-lg hover:bg-navy-700/30 transition-all duration-200"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/login" 
                  className="px-5 py-2 text-sm font-semibold text-text-gray border-2 border-navy-700 rounded-lg hover:border-accent-blue hover:bg-navy-700/50 transition-all duration-200"
                >
                  Log in
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/register"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-button rounded-lg shadow-md hover:shadow-glow-blue transition-all duration-200 btn-premium"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          ) : (
            <div className="relative">
              <motion.button
                onClick={() => setUserMenuOpen((s) => !s)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-gray border-2 border-navy-700 rounded-lg hover:border-accent-blue hover:bg-navy-700/30 transition-all duration-200"
                aria-expanded={userMenuOpen}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-button"></div>
                <span className="hidden sm:inline">{user.name ?? user.email}</span>
                <svg className="w-4 h-4 text-text-muted" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>

              {userMenuOpen && (
                <motion.div 
                  className="absolute right-0 mt-2 w-48 glass-card z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Link 
                    to="/personal" 
                    onClick={() => setUserMenuOpen(false)} 
                    className="block px-4 py-3 text-sm font-medium text-text-gray hover:text-text-white hover:bg-navy-700/50 transition-colors"
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => { setUserMenuOpen(false); logout(); }} 
                    className="w-full text-left px-4 py-3 text-sm font-medium text-text-gray hover:text-text-white border-t border-navy-700 hover:bg-navy-700/50 transition-colors"
                  >
                    Log out
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((s) => !s)}
            className="p-2 rounded-lg border-2 border-slate-700 hover:border-slate-600 bg-slate-800/30 transition-all"
          >
            <svg className="w-6 h-6 text-slate-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-slate-900/95 backdrop-blur-sm border-t-2 border-slate-800 transform origin-top transition-all duration-300 ease-in-out ${
          open ? 'scale-y-100 opacity-100 pointer-events-auto' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
          {[
            { to: '/', label: 'Home' },
            { to: '/how-it-works', label: 'How it works' },
            { to: '/solutions', label: 'Product' },
            { to: '/pricing', label: 'Pricing' },
            { to: '/docs', label: 'Docs & API' },
            { to: '/resources', label: 'Resources' },
            { to: '/support', label: 'Support' },
            { to: '/personal/contact', label: 'Contact' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-4 pt-4 border-t-2 border-slate-800 flex flex-col gap-2">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setOpen(false)} 
                  tabIndex={open ? 0 : -1} 
                  className="px-4 py-2 text-sm font-semibold text-slate-300 border-2 border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-800 text-center transition-all"
                >
                  Log in
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-center shadow-md"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="px-4 py-2 text-sm font-medium text-slate-300">{user.name ?? user.email}</div>
                <button 
                  onClick={() => { setOpen(false); logout(); }} 
                  className="text-sm font-medium text-slate-300 text-left px-4 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
