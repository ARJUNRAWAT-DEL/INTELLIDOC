import React, { useEffect } from 'react';

// Google Identity Services (GSI) button for frontend-only sign-in (no backend required).
// To use, register your app in Google Cloud Console and get a client ID.
// This component loads the GSI script and renders the Google Sign-In button into a div.

type Props = {
  clientId: string;
  onSuccess?: (user: { email?: string; name?: string; picture?: string; token?: string }) => void;
  onError?: (err: any) => void;
};

const GoogleSignIn: React.FC<Props> = ({ clientId, onSuccess, onError }) => {
  useEffect(() => {
    if (!clientId) return;

    const win = window as any;

    const attach = () => {
      try {
        if (!win.google || !win.google.accounts || !win.google.accounts.id) {
          // script not loaded yet
          return;
        }

        win.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            try {
              const token = response?.credential;
              if (!token) {
                if (onError) onError(new Error('No credential returned'));
                return;
              }
              const parts = token.split('.');
              const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              const user = { email: payload.email, name: payload.name || payload.given_name, picture: payload.picture, token };
              if (onSuccess) onSuccess(user);
            } catch (e) {
              if (onError) onError(e);
            }
          },
        });

        const container = document.getElementById('google-signin-button');
        if (container) {
          win.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large' });
        }
      } catch (e) {
        if (onError) onError(e);
      }
    };

    // If script already present, attach immediately
    if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.id) {
      attach();
    } else {
      // otherwise create script and attach on load
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => attach();
  script.onerror = () => { if (onError) onError(new Error('Failed to load GSI script')); };
      document.head.appendChild(script);
    }

    return () => {
      // no reliable cleanup for GSI. Keep script for app lifetime.
    };
  }, [clientId, onSuccess, onError]);

  return <div id="google-signin-button" />;
};

export default GoogleSignIn;
