import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService, API_URL } from '../services/api';

type LoginProps = { onSuccess?: () => void; onCancel?: () => void };

export default function Login({ onSuccess, onCancel }: LoginProps) {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const finish = useCallback((cb?: () => void) => {
    if (cb) return cb();
    try {
      if (email) localStorage.setItem('intellidoc_user', JSON.stringify({ email }));
    } catch (e) {
      // ignore
    }
    navigate('/');
  }, [email, navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        if ((ApiService as any).login) {
          const data = await (ApiService as any).login({ email, password });
          const token = data?.token;
          if (token) {
            if (remember) ApiService.setToken(token);
            else sessionStorage.setItem('intellidoc_token', token);
          }
          if (data?.user) localStorage.setItem('intellidoc_user', JSON.stringify(data.user));
          else localStorage.setItem('intellidoc_user', JSON.stringify({ email }));
          finish(onSuccess);
        } else {
          // dev fallback
          await new Promise((r) => setTimeout(r, 400));
          const fake = 'dev-token-' + Math.random().toString(36).slice(2, 9);
          if (remember) ApiService.setToken(fake);
          else sessionStorage.setItem('intellidoc_token', fake);
          localStorage.setItem('intellidoc_user', JSON.stringify({ email }));
          finish(onSuccess);
        }
      } catch (err: any) {
        setError(err?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember, finish, onSuccess]
  );

  const handleSocial = useCallback((provider: 'google' | 'github') => {
    const redirect = `${window.location.origin}/oauth-callback`;

    (async () => {
  // Open a popup synchronously to preserve the user gesture (prevents popup blockers)
  let popup: Window | null = null;
      try {
        // compute centered position where possible
        const w = 600;
        const h = 700;
        const left = typeof window.screenX === 'number' ? Math.max(0, window.screenX + Math.round((window.outerWidth - w) / 2)) : undefined;
        const top = typeof window.screenY === 'number' ? Math.max(0, window.screenY + Math.round((window.outerHeight - h) / 2)) : undefined;
        const features = `width=${w},height=${h}${left !== undefined ? `,left=${left}` : ''}${top !== undefined ? `,top=${top}` : ''},resizable=yes,scrollbars=yes`;
  popup = window.open('about:blank', 'oauth', features);
        if (popup) {
          try {
            // write a minimal loading page so the popup is visible (helps with some blockers/visibility issues)
            popup.document.write(`<!doctype html><html><head><title>Signing in…</title><meta name="viewport" content="width=device-width,initial-scale=1" /><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;color:#111} .box{text-align:center;padding:20px} .spinner{width:36px;height:36px;border-radius:50%;border:4px solid #eee;border-top-color:#0b6623;animation:spin 1s linear infinite;margin:0 auto 12px}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div class="box"><div class="spinner" aria-hidden></div><div>Opening sign-in...</div></div></body></html>`);
            popup.document.close();
            try { popup.focus(); } catch (e) { /* ignore */ }
          } catch (e) {
            // ignore write errors (some browsers restrict scripting on new windows)
          }
        }
      } catch (e) {
        popup = null;
      }

        // If popup was blocked (null), immediately start an in-window redirect as a fallback so
        // the user still sees the provider page and can choose their account. Construct the
        // backend oauth start URL directly (ApiService.getOauthUrl doesn't need a network call).
        if (!popup) {
          try {
            const immediateUrl = ApiService.getOauthUrl(provider, redirect);
            console.warn('Popup blocked — redirecting current window to OAuth URL for provider:', provider, immediateUrl);
            window.location.href = immediateUrl;
            return;
          } catch (err) {
            console.warn('Failed to perform immediate OAuth redirect', err);
            // continue and let the async flow try to open or fallback later
          }
        }

      try {
        const cfg = await ApiService.getOauthConfig();
        if (cfg && cfg[provider]) {
          const url = ApiService.getOauthUrl
            ? ApiService.getOauthUrl(provider, redirect)
            : `${API_URL}/auth/${provider}?redirect_uri=${encodeURIComponent(redirect)}`;

          // If popup was successfully opened, navigate it to the auth URL. Otherwise navigate current window.
          if (popup) {
            try {
              // some browsers refuse to set location on a window opened with different features; try setting href
              popup.location.href = url;
              try { popup.focus(); } catch (e) { /* ignore */ }
            } catch (e) {
              // If setting location fails, fallback to navigating current window
              window.location.href = url;
            }
            return;
          }

          // Popup could not be opened -> navigate current window to start auth
          window.location.href = url;
          return;
        }
      } catch (e) {
        // fall through to dev simulation
      }

      // If we reach here, provider not configured or fetch failed. Close popup if opened and do dev simulation.
      try {
        if (popup && !popup.closed) {
          try { popup.close(); } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }

      // Dev simulation inline: set token + user without opening a popup
      const fake = 'dev-oauth-' + Math.random().toString(36).slice(2, 9);
      const devEmail = `${provider}-user-${Math.random().toString(36).slice(2, 6)}@local.dev`;
      const devName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
      try {
        const usersRaw = localStorage.getItem('dev_users');
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        users[devEmail] = { name: devName, password: 'oauth' };
        localStorage.setItem('dev_users', JSON.stringify(users));
      } catch (e) {
        // ignore
      }

      // Persist token and user client-side
      try {
        ApiService.setToken(fake);
      } catch (e) {
        sessionStorage.setItem('intellidoc_token', fake);
      }
      localStorage.setItem('intellidoc_user', JSON.stringify({ email: devEmail, name: devName }));

      try {
        if (window.opener && typeof window.opener.postMessage === 'function') {
          window.opener.postMessage({ type: 'oauth', token: fake }, window.location.origin);
          try { window.close(); } catch (e) { /* ignore */ }
          return;
        }
      } catch (e) { /* ignore */ }

      navigate('/');
    })();
  }, [navigate]);

  // Listen for OAuth messages posted from the popup (backend -> /oauth-callback will postMessage to opener)
  useEffect(() => {
    const handler = async (ev: MessageEvent) => {
      try {
        // Only accept messages from the backend origin for safety
        const backendOrigin = API_URL.replace(/\/*$/, '');
        if (!ev.origin || !ev.data) return;
        if (ev.origin !== backendOrigin) return;
        const payload = ev.data as any;
        if (payload && payload.type === 'oauth' && payload.token) {
          const token = payload.token as string;
          try {
            ApiService.setToken(token);
          } catch (e) { /* ignore */ }

          // Try fetching user info from backend /auth/me to populate local storage
          try {
            const resp = await fetch(`${API_URL}/auth/me?token=${encodeURIComponent(token)}`);
            if (resp.ok) {
              const user = await resp.json();
              try { localStorage.setItem('intellidoc_user', JSON.stringify(user)); } catch (e) { /* ignore */ }
            }
          } catch (e) {
            // ignore fetch errors; still navigate to home
          }

          // Close any UI / navigate to home to show signed-in state
          navigate('/');
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #0D141F 100%)' }}
    >
      {/* Background glow orbs */}
      <div className="absolute top-1/4 -left-16 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-16 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

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
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-sm" style={{ color: '#8B92B0' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-[#9A4DFF] hover:text-[#B566FF] font-medium transition-colors"
              >
                Sign up free
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
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login form">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4D8E8' }}>
                Email address
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-[#8B92B0] outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(154,77,255,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-2" style={{ color: '#D4D8E8' }}>
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full rounded-xl px-4 py-3 pr-12 text-white placeholder-[#8B92B0] outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(154,77,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(154,77,255,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 bottom-3 text-[#8B92B0] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#8B92B0' }}>
                <input
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  type="checkbox"
                  className="rounded"
                  style={{ accentColor: '#9A4DFF' }}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot')}
                className="text-sm text-[#9A4DFF] hover:text-[#B566FF] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => (onCancel ? onCancel() : navigate('/'))}
                className="px-5 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#D4D8E8' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Back
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: '#8B92B0' }}>Or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Social Buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleSocial('google')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#D4D8E8' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={() => handleSocial('github')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#D4D8E8' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs" style={{ color: '#8B92B0' }}>
            By signing in, you agree to our{' '}
            <span className="text-[#9A4DFF] cursor-pointer hover:underline">Terms</span> &amp;{' '}
            <span className="text-[#9A4DFF] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
