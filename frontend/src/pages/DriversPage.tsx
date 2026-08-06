import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Driver, User } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Plus, Search, UserCheck } from 'lucide-react';

interface DriversPageProps {
  currentUser: User;
}

export const DriversPage: React.FC<DriversPageProps> = ({ currentUser }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, [search]);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers', { params: { search } });
      setDrivers(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to load drivers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/drivers', {
        name,
        license_number: licenseNumber,
        phone,
      });

      setIsModalOpen(false);
      setName('');
      setLicenseNumber('');
      setPhone('');
      fetchDrivers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register driver.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search driver name, license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
          />
        </div>

        {currentUser.role === 'ADMIN' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Register New Driver
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Driver Name</th>
              <th className="py-3 px-4">License Number</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#6B7280]">
                  Loading driver roster...
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#6B7280]">
                  No drivers registered in system.
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#18181B] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#146C43]" />
                    {d.name}
                  </td>
                  <td className="py-3 px-4 text-[#6B7280] font-mono text-xs">{d.license_number}</td>
                  <td className="py-3 px-4 text-[#18181B]">{d.phone}</td>
                  <td className="py-3 px-4">
                    <Badge status={d.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Fleet Driver"
      >
        <form onSubmit={handleCreateDriver} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Driver License Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SIM-B2-998811"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#ECECE8] pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Registering...' : 'Register Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
