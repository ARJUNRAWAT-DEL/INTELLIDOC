import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage(null);
    if (!token) return setMessage('Missing token');
    if (!password || password.length < 6) return setMessage('Password must be at least 6 characters');
    if (password !== confirm) return setMessage('Passwords do not match');
    setLoading(true);
    try {
      const res = await ApiService.resetPassword(token, password);
      setMessage(res.message || 'Password reset successful');
      // Optionally navigate to login after a short delay
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setMessage(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-2">Set a new password</h2>
        <p className="text-sm text-gray-600 mb-4">Choose a new password for your account.</p>

        {message && <div className="mb-3 text-sm text-gray-700 bg-gray-50 p-2 rounded">{message}</div>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">New password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3" />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700">Confirm password</span>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3" />
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-[var(--nav-green)] text-white rounded-md">
              {loading ? 'Resetting…' : 'Set new password'}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 border rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
