import React, { useState } from 'react';
import api from '../services/api';
import { User } from '../types';
import { ShieldCheck, UserCheck, AlertCircle, Building2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@minefleet.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      onLoginSuccess(user, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or login failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E6E6E2] rounded-xl p-8 shadow-xs">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#146C43] text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-xs">
            M
          </div>
          <h2 className="text-2xl font-bold text-[#18181B]">MineFleet Portal</h2>
          <p className="text-sm text-[#6B7280]">Multi-Location Mining Fleet System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43] transition-colors"
              placeholder="user@minefleet.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary mt-2 flex items-center justify-center"
          >
            {loading ? 'Authenticating...' : 'Sign In to MineFleet'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#ECECE8]">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3 text-center">
            Demo Account Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickSelect('admin@minefleet.com')}
              className="p-2 rounded-lg border border-[#E6E6E2] text-xs text-left hover:bg-[#F5F5F3] transition-colors flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-1 font-semibold text-[#18181B]">
                <ShieldCheck className="w-3 h-3 text-[#146C43]" />
                Super Admin
              </div>
              <span className="text-[10px] text-[#6B7280] truncate">admin@minefleet.com</span>
            </button>

            <button
              onClick={() => handleQuickSelect('admin.loc-msa@minefleet.com')}
              className="p-2 rounded-lg border border-[#E6E6E2] text-xs text-left hover:bg-[#F5F5F3] transition-colors flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-1 font-semibold text-[#18181B]">
                <Building2 className="w-3 h-3 text-[#146C43]" />
                Site Admin
              </div>
              <span className="text-[10px] text-[#6B7280] truncate">admin.loc-msa@minefleet.com</span>
            </button>

            <button
              onClick={() => handleQuickSelect('approver1@minefleet.com')}
              className="p-2 rounded-lg border border-[#E6E6E2] text-xs text-left hover:bg-[#F5F5F3] transition-colors flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-1 font-semibold text-[#18181B]">
                <UserCheck className="w-3 h-3 text-[#146C43]" />
                Approver L1
              </div>
              <span className="text-[10px] text-[#6B7280] truncate">approver1@minefleet.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
