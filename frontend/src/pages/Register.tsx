import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  if (res?.user) localStorage.setItem('intellidoc_user', JSON.stringify(res.user));
  else localStorage.setItem('intellidoc_user', JSON.stringify({ email, name }));
  navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[var(--demo-pink-1)] p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-extrabold text-[var(--nav-green)] mb-2">Create an account</h2>
        <p className="text-sm text-gray-600 mb-6">Register to get started with IntelliDoc</p>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">Full name</span>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-200 px-4 py-3" />
          </label>
          <div>
            <button type="submit" className={`w-full px-4 py-3 rounded-full text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[var(--nav-green)] hover:shadow-md'}`} disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
