import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage(null);
    if (!token) return setMessage("Missing token");
    if (!password || password.length < 6)
      return setMessage("Password must be at least 6 characters");
    if (password !== confirm) return setMessage("Passwords do not match");
    setLoading(true);
    try {
      const res = await ApiService.resetPassword(token, password);
      setMessage(res.message || "Password reset successful");
      // Optionally navigate to login after a short delay
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setMessage(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password update"
      title="Set a new password with the same premium interface."
      subtitle="Once confirmed, you’ll be sent back to sign in with a clean reset flow."
      asideTitle="Reset flow"
      asideText="This page stays focused on the password change and nothing else."
      asidePoints={[
        "Token is prefilled from the URL if present",
        "Strong validation before submission",
        "Automatic return to sign-in after success",
      ]}
    >
      <div className="w-full max-w-md mx-auto rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-2xl shadow-2xl p-6 md:p-8">
        <h2 className="text-3xl font-black mb-2 text-white">
          Set a new password
        </h2>
        <p className="text-sm text-slate-200/75 mb-4">
          Choose a new password for your account.
        </p>

        {message && (
          <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 px-4 py-2 font-semibold text-slate-950"
            >
              {loading ? "Resetting…" : "Set new password"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white backdrop-blur-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
