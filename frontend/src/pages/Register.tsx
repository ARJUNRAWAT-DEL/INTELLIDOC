import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
  const res = await ApiService.register({ name, email, password });
  const token = res?.token;
  if (token) ApiService.setToken(token);
  // store user returned by backend (or minimal fallback)
  if (res?.user) localStorage.setItem('intellidoc_user', JSON.stringify(res.user));
  else localStorage.setItem('intellidoc_user', JSON.stringify({ email, name }));
  navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #0D141F 100%)' }}
    >
      {/* Background glow orbs */}
      <div className="absolute top-1/4 -right-16 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-16 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Glass card */}
        <div
          className="rounded-2xl border border-white/10 p-8 backdrop-blur-xl"
          style={{ background: 'rgba(17, 21, 43, 0.75)' }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#9A4DFF] to-[#4F9CFF] flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, Inter, system-ui' }}>IntelliDoc</span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-sm" style={{ color: '#8B92B0' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#9A4DFF] hover:text-[#B566FF] font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4D8E8' }}>
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-[#8B92B0] outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(154,77,255,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4D8E8' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-[#8B92B0] outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(154,77,255,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4D8E8' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-[#8B92B0] outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(154,77,255,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? 'rgba(154,77,255,0.5)' : 'linear-gradient(90deg, #9A4DFF, #B566FF)',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(154,77,255,0.4)',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(154,77,255,0.6)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(154,77,255,0.4)'; }}
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              )}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Feature highlights */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-center mb-3" style={{ color: '#8B92B0' }}>What you get for free</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '📄', label: '50 docs/mo' },
                { icon: '⚡', label: 'Instant AI' },
                { icon: '🔒', label: 'Secure' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium" style={{ color: '#D4D8E8' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: '#8B92B0' }}>
            By signing up, you agree to our{' '}
            <span className="text-[#9A4DFF] cursor-pointer hover:underline">Terms</span> &amp;{' '}
            <span className="text-[#9A4DFF] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
