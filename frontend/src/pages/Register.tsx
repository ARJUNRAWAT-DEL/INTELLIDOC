import React, { useState } from "react";
import { ApiService } from "../services/api";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (res?.user)
        localStorage.setItem("intellidoc_user", JSON.stringify(res.user));
      else
        localStorage.setItem(
          "intellidoc_user",
          JSON.stringify({ email, name }),
        );
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join IntelliDoc"
      title="Create your account in a polished, cosmic workspace."
      subtitle="Sign up once and use the same account to upload documents, search content, and access the admin portal if you’re the owner."
      asideTitle="What you get"
      asideText="A clean onboarding path that feels premium and gives you a real place to start."
      asidePoints={[
        "Password hashing with per-user salt",
        "Lower-cased email normalization for reliable login",
        "Immediately available onboarding and dashboard routes",
      ]}
    >
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-2xl shadow-2xl p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-black text-white">Create an account</h2>
          <p className="mt-2 text-sm text-slate-200/75">
            Register to get started with IntelliDoc.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Full name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className={`w-full rounded-full px-4 py-3 font-semibold text-slate-950 ${loading ? "bg-slate-400" : "bg-gradient-to-r from-cyan-300 to-fuchsia-400"}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white backdrop-blur-xl"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
