import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Vehicle, User } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Plus, Search, Truck } from 'lucide-react';

interface VehiclesPageProps {
  currentUser: User;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({ currentUser }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('PASSENGER');
  const [ownership, setOwnership] = useState('COMPANY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter]);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles', {
        params: { search, status: statusFilter },
      });
      setVehicles(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/vehicles', {
        plate_number: plateNumber,
        brand,
        model,
        type,
        ownership,
      });

      setIsModalOpen(false);
      setPlateNumber('');
      setBrand('');
      setModel('');
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search plate, brand, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="RESERVED">RESERVED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Fleet Vehicle
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Plate Number</th>
              <th className="py-3 px-4">Brand & Model</th>
              <th className="py-3 px-4">Vehicle Type</th>
              <th className="py-3 px-4">Ownership</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                  Loading fleet vehicles...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                  No vehicles found in fleet registry.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#18181B] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#146C43]" />
                    {v.plate_number}
                  </td>
                  <td className="py-3 px-4 text-[#18181B] font-medium">
                    {v.brand} {v.model}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#6B7280]">{v.type}</td>
                  <td className="py-3 px-4">
                    <Badge status={v.ownership} />
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={v.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Fleet Vehicle to Registry"
      >
        <form onSubmit={handleCreateVehicle} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Plate Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. B 9999 MNE"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Brand
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Toyota"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Model
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hilux 4x4"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                <option value="PASSENGER">PASSENGER</option>
                <option value="CARGO">CARGO</option>
                <option value="HEAVY_EQUIPMENT">HEAVY_EQUIPMENT</option>
                <option value="AMBULANCE">AMBULANCE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Ownership Classification
              </label>
              <select
                value={ownership}
                onChange={(e) => setOwnership(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                <option value="COMPANY">COMPANY (Owned)</option>
                <option value="RENTAL">RENTAL (Leased)</option>
              </select>
            </div>
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
              {submitting ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
