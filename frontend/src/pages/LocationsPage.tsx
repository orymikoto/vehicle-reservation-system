import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin } from 'lucide-react';
import { Location } from '../types';
import api from '../services/api';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'HEADQUARTERS' | 'BRANCH' | 'MINE'>('MINE');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/locations?active_only=false');
      setLocations(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post('/locations', {
        code,
        name,
        region,
        address,
        type,
        is_active: true,
      });
      setIsModalOpen(false);
      setCode('');
      setName('');
      setRegion('');
      setAddress('');
      setType('MINE');
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create location.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#18181B]">Location Management</h2>
          <p className="text-xs text-[#6B7280]">Configure operational mining sites, headquarters, and branch offices</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#146C43] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0F5A37] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Operational Location
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6B7280] text-sm">Loading locations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white border border-[#E6E6E2] rounded-xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 bg-[#F5F5F3] text-[#146C43] rounded-md border border-[#E6E6E2]">
                  {loc.code}
                </span>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                  loc.type === 'HEADQUARTERS'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : loc.type === 'BRANCH'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {loc.type}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#18181B]">{loc.name}</h3>
                <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#146C43]" />
                  {loc.region}
                </p>
              </div>

              {loc.address && (
                <p className="text-xs text-[#6B7280] bg-[#FAFAF8] p-3 rounded-lg border border-[#E6E6E2]">
                  {loc.address}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E6E2] space-y-4">
            <h3 className="text-lg font-bold text-[#18181B]">Add New Location</h3>
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Code (e.g. LOC-MSG)</label>
                  <input
                    required
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="LOC-MSG"
                    className="w-full text-sm border border-[#E6E6E2] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-sm border border-[#E6E6E2] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                  >
                    <option value="MINE">MINE</option>
                    <option value="BRANCH">BRANCH</option>
                    <option value="HEADQUARTERS">HEADQUARTERS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Location Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mine Site G"
                  className="w-full text-sm border border-[#E6E6E2] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Region</label>
                <input
                  required
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="East Kalimantan"
                  className="w-full text-sm border border-[#E6E6E2] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Detailed site address..."
                  className="w-full text-sm border border-[#E6E6E2] rounded-lg p-3 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#18181B] border border-[#E6E6E2] rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#146C43] text-white text-sm font-semibold rounded-lg hover:bg-[#0F5A37] transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
