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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 max-h-[calc(100vh-4rem)] overflow-auto relative">
        {/* Top-right sign-up CTA: sticky so it's always visible on small viewports */}
        <div className="sticky top-0 z-20 bg-white -mx-6 px-6 pt-2 pb-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-3 py-1 text-sm bg-[var(--nav-green)] text-white rounded-md shadow-sm"
            >
              New here? Sign up
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-2">Sign in</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sign in with your account or continue with Google/GitHub. In local dev the form falls back to a mock.
        </p>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>}

  <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[var(--nav-green)]"
            />
          </label>

          <label className="block relative">
            <span className="text-sm text-gray-700">Password</span>
            <div className="mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[var(--nav-green)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-8 text-sm text-gray-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center text-sm">
              <input
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                type="checkbox"
                className="mr-2"
              />
              Remember me
            </label>
            <button type="button" onClick={() => navigate('/forgot')} className="text-sm text-[var(--nav-green)]">
              Forgot?
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--nav-green)] text-white rounded-md"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => (onCancel ? onCancel() : navigate('/'))}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
        {/* Sign-up banner - visible immediately so users don't have to scroll */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-700 font-medium">New here?</div>
            <div className="text-xs text-gray-500">Create an account to save documents and settings.</div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-[var(--nav-green)] text-white rounded-md shadow-sm"
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-center text-sm text-gray-500 mb-3">Or continue with</div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSocial('google')}
              className="flex-1 px-4 py-2 border rounded-md bg-white hover:shadow"
            >
              Google
            </button>
            <button
              onClick={() => handleSocial('github')}
              className="px-4 py-2 border rounded-md bg-white hover:shadow"
            >
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
