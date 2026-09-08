'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LogIn, Lock, Mail, AlertCircle, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    // Automatically split name into firstName and lastName for the backend service
    let payload;
    if (isRegister) {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      payload = { email, password, firstName, lastName };
    } else {
      payload = { email, password };
    }

    try {
      const res = await api.post(endpoint, payload);
      const data = res.data?.data || res.data;
      
      if (data.token) {
        setAuth(data.token, data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const resData = err.response?.data;

      // Bulletproof error handling to prevent any .map() or rendering crashes
      if (!resData) {
        setError('Network error: Unable to connect to backend server.');
      } else if (typeof resData === 'string') {
        setError(resData);
      } else if (Array.isArray(resData.errors)) {
        setError(resData.errors.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', '));
      } else {
        setError(resData.error || resData.message || 'Authentication failed. Please check server logs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] text-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-[#131B2E] border border-violet-900/40 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center border border-violet-500/30 mb-3 shadow-lg shadow-violet-500/10">
            {isRegister ? <UserPlus className="w-6 h-6 text-violet-400" /> : <LogIn className="w-6 h-6 text-violet-400" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isRegister ? 'Create NOVA Account' : 'Welcome to NOVA'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isRegister ? 'Sign up to start building workspaces' : 'Sign in to manage your workspaces'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Neha Paladugu"
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neha@nova.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-violet-600/25 border border-violet-400/30 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-gray-400 hover:text-violet-400 transition-colors font-medium"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}