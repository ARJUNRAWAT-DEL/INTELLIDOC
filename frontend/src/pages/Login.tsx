import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService, API_URL } from "../services/api";
import AuthShell from "../components/AuthShell";

type LoginProps = { onSuccess?: () => void; onCancel?: () => void };

export default function Login({ onSuccess, onCancel }: LoginProps) {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const finish = useCallback(
    (cb?: () => void) => {
      try {
        if (email)
          localStorage.setItem("intellidoc_user", JSON.stringify({ email }));
      } catch (e) {
        // ignore
      }
      if (cb) {
        try {
          cb();
        } catch (e) {
          console.warn("onSuccess handler failed", e);
        }
        return;
      }
      // if no callback provided (login via standalone page), notify app and navigate
      try {
        window.dispatchEvent(new Event("userLoggedIn"));
      } catch (e) {
        /* ignore */
      }
      navigate("/");
    },
    [email, navigate],
  );

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
            else sessionStorage.setItem("intellidoc_token", token);
          }
          if (data?.user)
            localStorage.setItem("intellidoc_user", JSON.stringify(data.user));
          else
            localStorage.setItem("intellidoc_user", JSON.stringify({ email }));
          finish(onSuccess);
        } else {
          // dev fallback
          await new Promise((r) => setTimeout(r, 400));
          const fake = "dev-token-" + Math.random().toString(36).slice(2, 9);
          if (remember) ApiService.setToken(fake);
          else sessionStorage.setItem("intellidoc_token", fake);
          localStorage.setItem("intellidoc_user", JSON.stringify({ email }));
          finish(onSuccess);
        }
      } catch (err: any) {
        setError(err?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember, finish, onSuccess],
  );

  const handleSocial = (provider: "google" | "github") => {
    const params = new URLSearchParams({
      provider,
      redirect: window.location.origin,
    });
    window.location.href = `${API_URL}/auth/oauth?${params.toString()}`;
  };

  return (
    <AuthShell
      eyebrow="Secure Access"
      title="Welcome back"
      subtitle="Sign in to your IntelliDoc account. Access your documents, analysis, and settings from anywhere."
      asideTitle="Why IntelliDoc?"
      asideText="Enterprise-grade document AI with privacy-first architecture. Your data stays secure with end-to-end encryption."
      asidePoints={[
        "Email/password with hashed credentials",
        "Google & GitHub social sign-in",
        "Remember-me and password reset",
      ]}
    >
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-2xl shadow-2xl p-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          aria-label="Login form"
        >
          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            />
          </label>

          <label className="block relative">
            <span className="text-sm font-medium text-slate-200">Password</span>
            <div className="mt-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 pr-16 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center text-slate-200/80">
              <input
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                type="checkbox"
                className="mr-2 accent-cyan-300"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot")}
              className="text-cyan-200 hover:text-cyan-100"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-950 px-2 text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocial("google")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white hover:bg-white/10"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocial("github")}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white hover:bg-white/10"
            >
              GitHub
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-200/70">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Sign up
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
