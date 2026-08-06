import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MaintenanceLog, Vehicle, User } from '../types';
import { Modal } from '../components/Modal';
import { Plus, Wrench } from 'lucide-react';

interface MaintenancePageProps {
  currentUser: User;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ currentUser }) => {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchMaintenanceLogs();
  }, []);

  const fetchMaintenanceLogs = async () => {
    try {
      const res = await api.get('/maintenance-logs');
      setMaintenanceLogs(res.data.data.data || res.data.data);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#18181B]">Workshop Maintenance Records</h3>
          <p className="text-xs text-[#6B7280]">
            Monitor vehicle servicing, workshop repair costs, and routine schedules
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
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
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                  Loading maintenance logs...
                </td>
              </tr>
            ) : maintenanceLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                  No maintenance logs recorded.
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
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate_number} ({v.brand} {v.model})
                </option>
              ))}
            </select>
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
