import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Reservation, Vehicle, Driver, User } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Plus, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ReservationsPageProps {
  currentUser: User;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ currentUser }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [approvers, setApprovers] = useState<User[]>([]);

  // Form Fields
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [approver1Id, setApprover1Id] = useState('');
  const [approver2Id, setApprover2Id] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [search, statusFilter]);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations', {
        params: { search, status: statusFilter },
      });
      setReservations(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setFormError('');
    setIsModalOpen(true);
    try {
      const [vehRes, drvRes, appRes] = await Promise.all([
        api.get('/vehicles/available'),
        api.get('/drivers/available'),
        api.get('/auth/approvers'),
      ]);
      setAvailableVehicles(vehRes.data.data);
      setAvailableDrivers(drvRes.data.data);
      setApprovers(appRes.data.data);

      if (vehRes.data.data.length > 0) setVehicleId(vehRes.data.data[0].id);
      if (drvRes.data.data.length > 0) setDriverId(drvRes.data.data[0].id);
      if (appRes.data.data.length > 0) setApprover1Id(appRes.data.data[0].id);
      if (appRes.data.data.length > 1) setApprover2Id(appRes.data.data[1].id);
    } catch (err) {
      console.error('Failed to load modal dependencies', err);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (approver1Id === approver2Id) {
      setFormError('Level 1 and Level 2 approvers must be different persons.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/reservations', {
        vehicle_id: vehicleId,
        driver_id: driverId,
        purpose,
        destination,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        approver_1_id: approver1Id,
        approver_2_id: approver2Id,
      });

      setIsModalOpen(false);
      setPurpose('');
      setDestination('');
      fetchReservations();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search code, purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button onClick={handleOpenCreateModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Reservation Request
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Vehicle & Driver</th>
              <th className="py-3 px-4">Purpose & Destination</th>
              <th className="py-3 px-4">Schedule</th>
              <th className="py-3 px-4">Approval Levels</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                  Loading reservations...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                  No reservation records found.
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#18181B]">{r.reservation_code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#18181B]">{r.vehicle?.plate_number}</div>
                    <div className="text-xs text-[#6B7280]">
                      {r.vehicle?.model} • Driver: {r.driver?.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#18181B]">{r.purpose}</div>
                    <div className="text-xs text-[#6B7280]">{r.destination}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#6B7280]">
                    <div>Start: {new Date(r.start_datetime).toLocaleString()}</div>
                    <div>End: {new Date(r.end_datetime).toLocaleString()}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {r.approvals?.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#F5F5F3] border border-[#E6E6E2]"
                          title={`Approver: ${app.approver?.name || 'N/A'}`}
                        >
                          <span className="font-semibold text-[#6B7280]">L{app.approval_level}:</span>
                          {app.status === 'APPROVED' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : app.status === 'REJECTED' ? (
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Reservation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Vehicle Reservation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Assign Available Vehicle
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} - {v.brand} {v.model} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Assign Available Driver
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.license_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Purpose of Trip
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Field Inspection at Pit Alpha"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Destination
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Block 4 Sector C"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={endDatetime}
                onChange={(e) => setEndDatetime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              />
            </div>
          </div>

          <div className="border-t border-[#ECECE8] pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Level 1 Approver
              </label>
              <select
                value={approver1Id}
                onChange={(e) => setApprover1Id(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                {approvers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Level 2 Approver
              </label>
              <select
                value={approver2Id}
                onChange={(e) => setApprover2Id(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                {approvers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.email})
                  </option>
                ))}
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
              {submitting ? 'Submitting...' : 'Submit Reservation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
