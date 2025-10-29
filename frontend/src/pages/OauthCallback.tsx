import React, { useEffect } from 'react';
import { ApiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const OauthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      // Parse token from URL (search or hash)
      const params = new URLSearchParams(window.location.search);
      // token might also be in hash
      if (!params.get('token') && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const t = hash.get('token');
        if (t) params.set('token', t);
        const u = hash.get('user');
        if (u) params.set('user', u);
      }

      const finalToken = params.get('token');
      if (!finalToken) {
        // no token: just navigate home after a short pause
        setTimeout(() => navigate('/'), 800);
        return;
      }

      // Save token for API use
      try {
        ApiService.setToken(finalToken);
      } catch (e) {
        // ignore
      }

      // Prefer user info included in the redirect (frontend-friendly). If 'user' param present, use it.
      const userParam = params.get('user');
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem('intellidoc_user', JSON.stringify(user));
        } catch (e) {
          // ignore parsing errors and fall through to token decode
        }
      } else {
        // If no user param, try to decode id_token (JWT) on the client to get email/name
        try {
          if (finalToken && finalToken.split('.').length === 3) {
            const parts = finalToken.split('.');
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const user = { email: payload.email, name: payload.name || payload.preferred_username || payload.given_name };
            localStorage.setItem('intellidoc_user', JSON.stringify(user));
          } else {
            // fallback dev user
            const prev = localStorage.getItem('intellidoc_user');
            if (!prev) localStorage.setItem('intellidoc_user', JSON.stringify({ name: 'OAuth User' }));
          }
        } catch (e) {
          const prev = localStorage.getItem('intellidoc_user');
          if (!prev) localStorage.setItem('intellidoc_user', JSON.stringify({ name: 'OAuth User' }));
        }
      }

      // If opened as a popup, notify opener
      try {
        if (window.opener && typeof window.opener.postMessage === 'function') {
          // Post token to the opener window (parent) so it can finish sign-in without navigation
          window.opener.postMessage({ type: 'oauth', token: finalToken }, window.location.origin);
          // Attempt to close the popup after notifying opener. If this fails (some browsers), fall through
          try { window.close(); return; } catch (e) { /* ignore */ }
        }
      } catch (e) {
        // ignore
      }

      // redirect back to app
      setTimeout(() => navigate('/'), 400);
    };

    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded-2xl shadow">Completing sign-in...</div>
    </div>
  );
};

export default OauthCallback;
