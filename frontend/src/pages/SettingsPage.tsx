import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { User } from '../types';
import { Settings as SettingsIcon, Save, DollarSign, Fuel, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  currentUser: User;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [fuelPrice, setFuelPrice] = useState('15000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.data.fuel_price_per_liter) {
        setFuelPrice(res.data.data.fuel_price_per_liter);
      }
    } catch (err) {
      console.error('Failed to load system settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('/settings', {
        settings: [
          { key: 'fuel_price_per_liter', value: fuelPrice },
        ],
      });
      setMessage('System variables updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="card-enterprise max-w-md mx-auto my-12 text-center p-8">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#18181B]">Restricted Access</h3>
        <p className="text-xs text-[#6B7280] mt-1">
          Only Super Administrators are permitted to modify system configurations and operational parameters.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-12 text-center text-[#6B7280]">Loading System Configurations...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#146C43]/10 text-[#146C43] rounded-lg">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#18181B]">System Configurations</h2>
          <p className="text-xs text-[#6B7280]">Manage global operational constants and monetary variables</p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="card-enterprise space-y-6">
        {message && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-[#E6E6E2] bg-[#FAFAF8]">
            <div className="p-2 bg-emerald-100 text-[#146C43] rounded-lg mt-0.5">
              <Fuel className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#18181B]">
                  Current Fuel Price per Liter (IDR)
                </label>
                <span className="text-[11px] font-medium text-[#6B7280]">Key: fuel_price_per_liter</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Changing this variable affects future refueling math (autocompleting cost & volume). Historical records in the database remain untouched for monetary accounting integrity.
              </p>
              <div className="relative w-64 pt-1">
                <DollarSign className="w-4 h-4 absolute left-3 top-3.5 text-[#6B7280]" />
                <input
                  type="number"
                  required
                  min="1000"
                  step="100"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm font-semibold bg-white focus:outline-none focus:border-[#146C43]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#ECECE8] pt-4">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving Configurations...' : 'Save Configuration Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
