import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
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
      setMessage(res.message || 'If that email exists, a reset link has been sent.');
      if (res.reset_link) setResetLink(res.reset_link);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-2">Reset password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the email address for your account and we'll send a reset link.</p>

        {message && <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">{message}</div>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-[var(--nav-green)]"
            />
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[var(--nav-green)] text-white rounded-md">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 border rounded-md">Cancel</button>
          </div>
        </form>

        {resetLink && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 text-sm rounded">
            Dev reset link (only for local/dev): <a className="text-[var(--nav-green)] break-all" href={resetLink}>{resetLink}</a>
          </div>
        )}
      </div>
    </div>
  );
}
