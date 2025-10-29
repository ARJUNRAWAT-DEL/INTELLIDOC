Server-side OAuth endpoints (placeholder)

This project includes minimal server-managed OAuth endpoints to support Google and GitHub sign-in flows.

Endpoints added in `app/main.py`:

- GET /auth/{provider}
  - provider: `google` or `github`
  - Accepts optional query parameter `redirect_uri` (the frontend URL that should receive the token and user after login).
  - If provider credentials (client id + secret) are configured in environment or settings, this endpoint will redirect the browser to the provider's authorization URL and the provider will later return to `/auth/callback` on the server.
  - If provider credentials are NOT configured, this endpoint will immediately redirect back to `redirect_uri` with a simulated dev token and a small user payload. This is deliberate to make local development easy.

- GET /auth/callback
  - Provider callback endpoint used by Google/GitHub to return an auth code.
  - The server will attempt to exchange the code for an access token and fetch a basic user profile.
  - On success, the server redirects the user-agent back to the original `redirect_uri` (carried in the `state`) with `?token=...&user={...}`.
  - If the provider is not configured, the endpoint falls back to a simulated redirect with a dev token and user.

Environment variables the server will read:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- PUBLIC_BASE_URL - optional (e.g. https://your-backend.example.com). Used to build the provider callback URL. Defaults to http://localhost:8000

How the frontend integrates:

- The frontend uses `ApiService.getOauthUrl(provider, redirectUri)` which points to `http://localhost:8000/auth/{provider}?redirect_uri={redirectUri}` by default.
- For production, configure the provider client ID + secret in your environment, set `PUBLIC_BASE_URL` to your backend's base URL, and ensure the OAuth provider settings (in Google Cloud Console or GitHub OAuth apps) include the server callback URL: `${PUBLIC_BASE_URL}/auth/callback`.

Security notes:

- The placeholder code attempts live token exchange using `requests` when credentials are available. Store client secrets securely and never commit them to source control.
- For production you should validate state, use PKCE for public clients, and issue your own session tokens (e.g., JWT) instead of directly passing provider access tokens to the frontend.

Local development:

- If you don't configure provider credentials, the endpoints will return simulated `dev-token-...` tokens and minimal user info so the frontend can behave realistically during testing.

If you want, I can add a small `/auth/me` endpoint that validates tokens (or retrieves user info) and returns the canonical user object for the frontend to call after receiving a token. Let me know if you'd like that next.
