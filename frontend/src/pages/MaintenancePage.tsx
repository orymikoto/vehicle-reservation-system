import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MaintenanceLog, Vehicle, User, Location, PaginatedMeta } from '../types';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { Plus, Wrench, Trash2, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface MaintenancePageProps {
  currentUser: User;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ currentUser }) => {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('service_date');
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Form
  const [vehicleId, setVehicleId] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState('ROUTINE');
  const [workshop, setWorkshop] = useState('');
  const [cost, setCost] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser.role === 'SUPER_ADMIN') {
      api.get('/locations?active_only=true').then((res) => setLocations(res.data.data));
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMaintenanceLogs();
  }, [search, locationFilter, sortBy, sortDirection, page]);

  const fetchMaintenanceLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/maintenance-logs', {
        params: {
          search,
          location_id: locationFilter,
          sort_by: sortBy,
          sort_direction: sortDirection,
          page,
          per_page: 15,
        },
      });

      const paginatedData = res.data.data;
      setMaintenanceLogs(paginatedData.data || []);
      setMeta({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        per_page: paginatedData.per_page || 15,
        total: paginatedData.total || 0,
        from: paginatedData.from || 0,
        to: paginatedData.to || 0,
      });
    } catch (err) {
      console.error('Failed to load maintenance logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setError('');
    try {
      const vehRes = await api.get('/vehicles');
      const vehList = vehRes.data.data.data || vehRes.data.data;
      setVehicles(vehList);
      if (vehList.length > 0) setVehicleId(vehList[0].id);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    }
  };

  const handleCreateMaintenanceLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/maintenance-logs', {
        vehicle_id: vehicleId,
        service_date: serviceDate,
        service_type: serviceType,
        workshop,
        cost: parseFloat(cost),
        next_service_date: nextServiceDate || null,
        notes,
      });

      setIsModalOpen(false);
      setWorkshop('');
      setCost('');
      setNextServiceDate('');
      setNotes('');
      fetchMaintenanceLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record maintenance log.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaintenanceLog = async (log: MaintenanceLog) => {
    if (!confirm(`Are you sure you want to delete maintenance record for ${log.vehicle?.plate_number} (${log.service_type})? This action will be recorded in audit logs.`)) return;

    try {
      await api.delete(`/maintenance-logs/${log.id}`);
      fetchMaintenanceLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete maintenance log.');
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: v.plate_number,
    sublabel: `${v.brand} ${v.model}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search vehicle plate, workshop..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          {/* Super Admin Only Site Filter */}
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
              <option value="service_date">Service Date</option>
              <option value="cost">Cost</option>
              <option value="service_type">Service Type</option>
              <option value="workshop">Workshop</option>
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
          <button onClick={handleOpenModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Record Service Event
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Service Date</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Workshop</th>
              <th className="py-3 px-4">Cost (IDR)</th>
              <th className="py-3 px-4">Next Scheduled Service</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B7280]">
                  Loading maintenance logs...
                </td>
              </tr>
            ) : maintenanceLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B7280]">
                  No maintenance records matching criteria.
                </td>
              </tr>
            ) : (
              maintenanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">{log.service_date}</td>
                  <td className="py-3 px-4 font-bold text-[#18181B] flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#146C43]" />
                    {log.vehicle?.plate_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      {log.service_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#18181B] font-medium">{log.workshop}</td>
                  <td className="py-3 px-4 font-bold text-[#18181B]">
                    IDR {Number(log.cost).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">
                    {log.next_service_date || '-'}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#6B7280]">{log.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'VEHICLE_ADMIN') && (
                      <button
                        onClick={() => handleDeleteMaintenanceLog(log)}
                        title="Delete Maintenance Log"
                        className="p-1.5 text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              <span className="font-bold text-[#18181B]">{meta.total}</span> maintenance records
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
        title="Record Vehicle Maintenance"
      >
        <form onSubmit={handleCreateMaintenanceLog} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Vehicle (Searchable)
            </label>
            <SearchableSelect
              options={vehicleOptions}
              value={vehicleId}
              onChange={(val) => setVehicleId(val)}
              placeholder="Search plate, model..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Service Date
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                <option value="ROUTINE">ROUTINE (Scheduled)</option>
                <option value="REPAIR">REPAIR (Unscheduled)</option>
                <option value="EMERGENCY">EMERGENCY Breakdown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Workshop Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. United Tractors Workshop"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Maintenance Cost (IDR)
              </label>
              <input
                type="number"
                required
                placeholder="3500000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Recommended Next Service Date
            </label>
            <input
              type="date"
              value={nextServiceDate}
              onChange={(e) => setNextServiceDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Work Done / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Replaced oil filter and front brake pads..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {submitting ? 'Saving...' : 'Record Maintenance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
