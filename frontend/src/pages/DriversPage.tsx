import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Driver, User, Location, PaginatedMeta } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Plus, Search, UserCheck, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface DriversPageProps {
  currentUser: User;
}

export const DriversPage: React.FC<DriversPageProps> = ({ currentUser }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
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
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [locationId, setLocationId] = useState(currentUser.location_id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser.role === 'SUPER_ADMIN') {
      fetchLocations();
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter, locationFilter, sortBy, sortDirection, page]);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations?active_only=true');
      setLocations(res.data.data);
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/drivers', {
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
      setDrivers(paginatedData.data || []);
      setMeta({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        per_page: paginatedData.per_page || 15,
        total: paginatedData.total || 0,
        from: paginatedData.from || 0,
        to: paginatedData.to || 0,
      });
    } catch (err) {
      console.error('Failed to load drivers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = async () => {
    setEditingDriver(null);
    setName('');
    setLicenseNumber('');
    setPhone('');
    setStatus('ACTIVE');
    setLocationId(currentUser.location_id || locations[0]?.id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (d: Driver) => {
    setEditingDriver(d);
    setName(d.name);
    setLicenseNumber(d.license_number);
    setPhone(d.phone);
    setStatus(d.status);
    setLocationId(d.location_id || currentUser.location_id || locations[0]?.id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, {
          name,
          license_number: licenseNumber,
          phone,
          status,
          location_id: locationId,
        });
      } else {
        await api.post('/drivers', {
          name,
          license_number: licenseNumber,
          phone,
          location_id: locationId,
        });
      }

      setIsModalOpen(false);
      fetchDrivers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save driver.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (d: Driver) => {
    if (!confirm(`Are you sure you want to delete driver ${d.name}?`)) return;

    try {
      await api.delete(`/drivers/${d.id}`);
      fetchDrivers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete driver.');
    }
  };

  const canManageDriver = (d: Driver) => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'VEHICLE_ADMIN' && currentUser.location_id === d.location_id) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter, Sort Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search driver name, license..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="ON_LEAVE">ON_LEAVE</option>
            <option value="TRANSFERRED">TRANSFERRED</option>
          </select>

          {/* Site Location Filter - Super Admin Only */}
          {currentUser.role === 'SUPER_ADMIN' && (
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
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
          <div className="flex items-center gap-1 bg-white border border-[#E6E6E2] rounded-lg h-10 px-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6B7280]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-full bg-transparent text-sm focus:outline-none pr-1"
            >
              <option value="created_at">Date Registered</option>
              <option value="name">Driver Name</option>
              <option value="license_number">License Number</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="text-xs font-bold text-[#146C43] px-1 hover:underline"
            >
              {sortDirection.toUpperCase()}
            </button>
          </div>
        </div>

        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'VEHICLE_ADMIN') && (
          <button onClick={handleOpenAddModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Register New Driver
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Driver Name</th>
              <th className="py-3 px-4">Assigned Site</th>
              <th className="py-3 px-4">License Number</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                  Loading driver roster...
                </td>
              </tr>
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                  No drivers matching criteria.
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#18181B] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#146C43]" />
                    {d.name}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#146C43]">
                    {d.location?.name || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-[#6B7280] font-mono text-xs">{d.license_number}</td>
                  <td className="py-3 px-4 text-[#18181B]">{d.phone}</td>
                  <td className="py-3 px-4">
                    <Badge status={d.status} />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {canManageDriver(d) ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(d)}
                          title="Edit Driver"
                          className="p-1.5 text-[#6B7280] hover:text-[#146C43] hover:bg-[#F5F5F3] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(d)}
                          title="Delete Driver"
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
              <span className="font-bold text-[#18181B]">{meta.total}</span> drivers
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? 'Edit Driver Information' : 'Register Fleet Driver'}
      >
        <form onSubmit={handleSaveDriver} className="space-y-4">
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

          {editingDriver && (
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
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
              {submitting ? 'Saving...' : editingDriver ? 'Update Driver' : 'Register Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
