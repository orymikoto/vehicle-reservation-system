import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FuelLog, Vehicle, Driver, User, Location, PaginatedMeta } from '../types';
import { Modal } from '../components/Modal';
import { SearchableSelect } from '../components/SearchableSelect';
import { Plus, Fuel, Trash2, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface FuelPageProps {
  currentUser: User;
}

export const FuelPage: React.FC<FuelPageProps> = ({ currentUser }) => {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, Sort, Pagination states
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('fuel_date');
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
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fuelPrice, setFuelPrice] = useState<number>(15000);

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
    if (currentUser.role === 'SUPER_ADMIN') {
      api.get('/locations?active_only=true').then((res) => setLocations(res.data.data));
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFuelLogs();
  }, [search, locationFilter, sortBy, sortDirection, page]);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fuel-logs', {
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
      setFuelLogs(paginatedData.data || []);
      setMeta({
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        per_page: paginatedData.per_page || 15,
        total: paginatedData.total || 0,
        from: paginatedData.from || 0,
        to: paginatedData.to || 0,
      });
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
      const [vehRes, drvRes, settingsRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/settings'),
      ]);

      const vehList = vehRes.data.data.data || vehRes.data.data;
      const drvList = drvRes.data.data.data || drvRes.data.data;
      const currentPrice = parseFloat(settingsRes.data.data?.fuel_price_per_liter || '15000');

      setFuelPrice(currentPrice);
      setVehicles(vehList);
      setDrivers(drvList);
      if (vehList.length > 0) setVehicleId(vehList[0].id);
      if (drvList.length > 0) setDriverId(drvList[0].id);
    } catch (err) {
      console.error('Failed to load dropdown items', err);
    }
  };

  // Bi-directional Fuel Calculation Handlers
  const handleCostChange = (val: string) => {
    setFuelCost(val);
    const numCost = parseFloat(val);
    if (!isNaN(numCost) && fuelPrice > 0) {
      const calculatedLiters = (numCost / fuelPrice).toFixed(1);
      setFuelAmount(calculatedLiters);
    } else if (val === '') {
      setFuelAmount('');
    }
  };

  const handleAmountChange = (val: string) => {
    setFuelAmount(val);
    const numAmount = parseFloat(val);
    if (!isNaN(numAmount) && fuelPrice > 0) {
      const calculatedCost = Math.round(numAmount * fuelPrice);
      setFuelCost(calculatedCost.toString());
    } else if (val === '') {
      setFuelCost('');
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

  const handleDeleteFuelLog = async (log: FuelLog) => {
    if (!confirm(`Are you sure you want to delete fuel log for ${log.vehicle?.plate_number} (${log.fuel_amount} L)? This action will be recorded in audit logs.`)) return;

    try {
      await api.delete(`/fuel-logs/${log.id}`);
      fetchFuelLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete fuel log.');
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: v.plate_number,
    sublabel: `${v.brand} ${v.model}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search vehicle plate, driver, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 h-10 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Super Admin Only Site Filter */}
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
                  <option value="fuel_date">Refuel Date</option>
                  <option value="fuel_amount">Fuel Amount</option>
                  <option value="fuel_cost">Fuel Cost</option>
                  <option value="odometer">Odometer</option>
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

        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'VEHICLE_ADMIN') && (
          <button onClick={handleOpenModal} className="btn-primary w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            Log Fuel Consumption
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="w-full text-left border-collapse min-w-[850px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Volume (Liters)</th>
              <th className="py-3 px-4">Cost (IDR)</th>
              <th className="py-3 px-4">Odometer</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B7280]">
                  Loading fuel records...
                </td>
              </tr>
            ) : fuelLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B7280]">
                  No fuel logs recorded matching criteria.
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
                  <td className="py-3 px-4 text-right">
                    {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'VEHICLE_ADMIN') && (
                      <button
                        onClick={() => handleDeleteFuelLog(log)}
                        title="Delete Fuel Log"
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
              <span className="font-bold text-[#18181B]">{meta.total}</span> fuel records
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Fuel Consumption">
        <form onSubmit={handleCreateFuelLog} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs text-[#146C43] flex items-center justify-between">
            <span>System Fuel Rate: <strong>IDR {fuelPrice.toLocaleString()} / Liter</strong></span>
            <span className="text-[11px] text-[#6B7280]">Bi-directional auto-calculation enabled</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                step="0.1"
                required
                placeholder="e.g. 10.0"
                value={fuelAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
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
                placeholder="e.g. 150000"
                value={fuelCost}
                onChange={(e) => handleCostChange(e.target.value)}
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
              placeholder="Refueling at Pit station..."
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
