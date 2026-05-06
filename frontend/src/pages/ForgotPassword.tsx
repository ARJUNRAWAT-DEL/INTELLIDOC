import React, { useState } from "react";
import { ApiService } from "../services/api";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const navigate = useNavigate();

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage(null);
    setResetLink(null);
    try {
      const res = await ApiService.forgotPassword(email);
      setMessage(
        res.message || "If that email exists, a reset link has been sent.",
      );
      if (res.reset_link) setResetLink(res.reset_link);
    } catch (err: any) {
      setMessage(err?.message || "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset access without breaking the flow."
      subtitle="Use the recovery screen to request a reset link while keeping the same cosmic visual language."
      asideTitle="Recovery notes"
      asideText="This stays intentionally simple so it is easy to complete under pressure."
      asidePoints={[
        "Requests are handled through the API layer",
        "A dev reset link is shown locally when available",
        "You can return to sign-in at any time",
      ]}
    >
      <div className="w-full max-w-md mx-auto rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-2xl shadow-2xl p-6 md:p-8">
        <h2 className="text-3xl font-black mb-2 text-white">Reset password</h2>
        <p className="text-sm text-slate-200/75 mb-4">
          Enter the email address for your account and we'll send a reset link.
        </p>

        {message && (
          <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending…" : "Send reset link"}
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

        {resetLink && (
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-sm text-amber-50">
            Dev reset link (only for local/dev):{" "}
            <a className="break-all text-cyan-100" href={resetLink}>
              {resetLink}
            </a>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
