import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Vehicle, User, Location, PaginatedMeta } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Plus, Search, Truck, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface VehiclesPageProps {
  currentUser: User;
}

export const VehiclesPage: React.FC<VehiclesPageProps> = ({ currentUser }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('PASSENGER');
  const [ownership, setOwnership] = useState('COMPANY');
  const [status, setStatus] = useState('AVAILABLE');
  const [locationId, setLocationId] = useState(currentUser.location_id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser.role === 'SUPER_ADMIN') {
      fetchLocations();
    }
  }, [currentUser]);

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter, locationFilter, sortBy, sortDirection, page]);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations?active_only=true');
      setLocations(res.data.data);
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles', {
        params: {
          search,
          status: statusFilter,
          location_id: locationFilter,
          sort_by: sortBy,
          sort_direction: sortDirection,
          page,
          per_page: 15,
        },
      });

      const paginatedData = res.data.data;
      setVehicles(paginatedData.data || []);
      setMeta({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        per_page: paginatedData.per_page || 15,
        total: paginatedData.total || 0,
        from: paginatedData.from || 0,
        to: paginatedData.to || 0,
      });
    } catch (err) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = async () => {
    setEditingVehicle(null);
    setPlateNumber('');
    setBrand('');
    setModel('');
    setType('PASSENGER');
    setOwnership('COMPANY');
    setStatus('AVAILABLE');
    setLocationId(currentUser.location_id || locations[0]?.id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (v: Vehicle) => {
    setEditingVehicle(v);
    setPlateNumber(v.plate_number);
    setBrand(v.brand);
    setModel(v.model);
    setType(v.type);
    setOwnership(v.ownership);
    setStatus(v.status);
    setLocationId(v.location_id || currentUser.location_id || locations[0]?.id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, {
          plate_number: plateNumber,
          brand,
          model,
          type,
          ownership,
          status,
          location_id: locationId,
        });
      } else {
        await api.post('/vehicles', {
          plate_number: plateNumber,
          brand,
          model,
          type,
          ownership,
          location_id: locationId,
        });
      }

      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (v: Vehicle) => {
    if (!confirm(`Are you sure you want to delete vehicle ${v.plate_number}?`)) return;

    try {
      await api.delete(`/vehicles/${v.id}`);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const canManageVehicle = (v: Vehicle) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'VEHICLE_ADMIN' && currentUser.location_id === v.location_id) return true;
    return false;
  };

  const canManage = (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'VEHICLE_ADMIN');
  const handleOpenCreateModal = () => handleOpenAddModal();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search plate, brand, model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43] w-full"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="IN_TRANSFER">IN_TRANSFER</option>
            </select>

            {/* Site Location Filter - Super Admin Only */}
            {currentUser.role === 'SUPER_ADMIN' && (
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43] w-full"
              >
                <option value="">All Mine Sites</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            )}

            {/* Sort By Dropdown */}
            <div className="flex items-center justify-between gap-1 bg-white border border-[#E6E6E2] rounded-lg h-10 px-2 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1 min-w-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-full bg-transparent text-sm focus:outline-none pr-1 truncate"
                >
                  <option value="created_at">Date Added</option>
                  <option value="plate_number">Plate Number</option>
                  <option value="brand">Brand / Model</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="text-xs font-bold text-[#146C43] px-1 hover:underline shrink-0"
              >
                {sortDirection.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {canManage && (
          <button onClick={handleOpenCreateModal} className="btn-primary w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            Add Fleet Vehicle
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        <table className="w-full text-left border-collapse min-w-[850px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Plate Number</th>
              <th className="py-3 px-4">Assigned Site</th>
              <th className="py-3 px-4">Brand & Model</th>
              <th className="py-3 px-4">Vehicle Type</th>
              <th className="py-3 px-4">Ownership</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                  Loading fleet vehicles...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                  No vehicles matching search criteria.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#18181B] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#146C43]" />
                    {v.plate_number}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#146C43]">
                    {v.location?.name || 'Unassigned'}
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
                  <td className="py-3 px-4 text-right space-x-2">
                    {canManageVehicle(v) ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          title="Edit Vehicle"
                          className="p-1.5 text-[#6B7280] hover:text-[#146C43] hover:bg-[#F5F5F3] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(v)}
                          title="Delete Vehicle"
                          className="p-1.5 text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-[#9CA3AF] italic">View Only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#ECECE8] bg-[#FAFAF8] text-xs text-[#6B7280]">
            <div>
              Showing <span className="font-bold text-[#18181B]">{meta.from}</span> to{' '}
              <span className="font-bold text-[#18181B]">{meta.to}</span> of{' '}
              <span className="font-bold text-[#18181B]">{meta.total}</span> vehicles
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-[#E6E6E2] bg-white text-[#18181B] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#146C43]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[#18181B]">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-[#E6E6E2] bg-white text-[#18181B] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#146C43]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Fleet Vehicle Details' : 'Add Fleet Vehicle to Registry'}
      >
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Operational Location
            </label>
            <select
              disabled={currentUser.role !== 'SUPER_ADMIN'}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

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

          {editingVehicle && (
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RESERVED">RESERVED</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="IN_TRANSFER">IN_TRANSFER</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[#ECECE8] pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
