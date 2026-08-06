import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FuelLog, Vehicle, Driver, User } from '../types';
import { Modal } from '../components/Modal';
import { Plus, Fuel } from 'lucide-react';

interface FuelPageProps {
  currentUser: User;
}

export const FuelPage: React.FC<FuelPageProps> = ({ currentUser }) => {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Form
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [odometer, setOdometer] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const fetchFuelLogs = async () => {
    try {
      const res = await api.get('/fuel-logs');
      setFuelLogs(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to load fuel logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setError('');
    try {
      const [vehRes, drvRes] = await Promise.all([api.get('/vehicles'), api.get('/drivers')]);
      const vehList = vehRes.data.data.data || vehRes.data.data;
      const drvList = drvRes.data.data.data || drvRes.data.data;

      setVehicles(vehList);
      setDrivers(drvList);
      if (vehList.length > 0) setVehicleId(vehList[0].id);
      if (drvList.length > 0) setDriverId(drvList[0].id);
    } catch (err) {
      console.error('Failed to load dropdown items', err);
    }
  };

  const handleCreateFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/fuel-logs', {
        vehicle_id: vehicleId,
        driver_id: driverId,
        fuel_date: fuelDate,
        fuel_amount: parseFloat(fuelAmount),
        fuel_cost: parseFloat(fuelCost),
        odometer: parseInt(odometer, 10),
        notes,
      });

      setIsModalOpen(false);
      setFuelAmount('');
      setFuelCost('');
      setOdometer('');
      setNotes('');
      fetchFuelLogs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record fuel log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#18181B]">Fuel Consumption Logs</h3>
          <p className="text-xs text-[#6B7280]">Track refueling events, volume, costs, and odometer readings</p>
        </div>

        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'VEHICLE_ADMIN') && (
          <button onClick={handleOpenModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Log Fuel Consumption
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Volume (Liters)</th>
              <th className="py-3 px-4">Cost (IDR)</th>
              <th className="py-3 px-4">Odometer</th>
              <th className="py-3 px-4">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                  Loading fuel records...
                </td>
              </tr>
            ) : fuelLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                  No fuel logs recorded.
                </td>
              </tr>
            ) : (
              fuelLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">{log.fuel_date}</td>
                  <td className="py-3 px-4 font-bold text-[#18181B] flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-[#146C43]" />
                    {log.vehicle?.plate_number}
                  </td>
                  <td className="py-3 px-4 text-[#18181B]">{log.driver?.name}</td>
                  <td className="py-3 px-4 font-semibold text-[#146C43]">{log.fuel_amount} L</td>
                  <td className="py-3 px-4 font-bold text-[#18181B]">
                    IDR {Number(log.fuel_cost).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">{log.odometer} KM</td>
                  <td className="py-3 px-4 text-xs text-[#6B7280]">{log.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Fuel Consumption">
        <form onSubmit={handleCreateFuelLog} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                    {v.plate_number} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Driver
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Refuel Date
              </label>
              <input
                type="date"
                required
                value={fuelDate}
                onChange={(e) => setFuelDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Fuel Amount (Liters)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="65.5"
                value={fuelAmount}
                onChange={(e) => setFuelAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
                Fuel Cost (IDR)
              </label>
              <input
                type="number"
                required
                placeholder="850000"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Current Odometer Reading (KM)
            </label>
            <input
              type="number"
              required
              placeholder="45200"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Notes / Location
            </label>
            <input
              type="text"
              placeholder="Refueling at Pit 3 station..."
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
              {submitting ? 'Saving...' : 'Save Fuel Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
