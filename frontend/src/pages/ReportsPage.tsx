import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Location } from '../types';
import { FileSpreadsheet, Download, Calendar, MapPin, CheckSquare, Square } from 'lucide-react';

interface ReportsPageProps {
  currentUser: User;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser }) => {
  const [downloading, setDownloading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectAllSites, setSelectAllSites] = useState(true);

  useEffect(() => {
    if (currentUser.role === 'SUPER_ADMIN') {
      api.get('/locations?active_only=true').then((res) => {
        const locs = res.data.data;
        setLocations(locs);
        setSelectedLocations(locs.map((l: Location) => l.id));
      });
    }
  }, [currentUser]);

  const handleToggleSelectAll = () => {
    if (selectAllSites) {
      setSelectedLocations([]);
      setSelectAllSites(false);
    } else {
      setSelectedLocations(locations.map((l) => l.id));
      setSelectAllSites(true);
    }
  };

  const handleToggleLocation = (id: string) => {
    if (selectedLocations.includes(id)) {
      const updated = selectedLocations.filter((item) => item !== id);
      setSelectedLocations(updated);
      setSelectAllSites(updated.length === locations.length);
    } else {
      const updated = [...selectedLocations, id];
      setSelectedLocations(updated);
      setSelectAllSites(updated.length === locations.length);
    }
  };

  const handleExportReservations = async () => {
    setDownloading(true);
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (currentUser.role === 'SUPER_ADMIN' && !selectAllSites) {
        params.location_ids = selectedLocations.join(',');
      }

      const response = await api.get('/reports/reservations/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reservations-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download Excel export', err);
      alert('Failed to generate report Excel export.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6E6E2] rounded-xl p-6 shadow-xs">
        <h3 className="text-lg font-bold text-[#18181B]">Enterprise Export Center</h3>
        <p className="text-xs text-[#6B7280]">
          Export complete fleet reservations and usage logs into Excel spreadsheets for offline auditing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter Criteria Panel */}
        <div className="bg-white border border-[#E6E6E2] rounded-xl p-6 space-y-5">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#146C43]" />
            Report Parameters
          </h4>

          {/* Date Range Selectors */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white focus:outline-none focus:border-[#146C43]"
              />
            </div>
          </div>

          {/* Super Admin Mine Site Checkboxes */}
          {currentUser.role === 'SUPER_ADMIN' && locations.length > 0 && (
            <div className="pt-4 border-t border-[#ECECE8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#6B7280] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#146C43]" />
                  Mine Sites Selection
                </label>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-[#146C43] hover:underline flex items-center gap-1"
                >
                  {selectAllSites ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  Select All
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {locations.map((loc) => {
                  const isChecked = selectedLocations.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className="flex items-center gap-2.5 text-xs text-[#18181B] cursor-pointer hover:bg-[#F5F5F3] p-1.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleLocation(loc.id)}
                        className="rounded text-[#146C43] focus:ring-[#146C43]"
                      />
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-[11px] text-[#6B7280]">({loc.code})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Export Card */}
        <div className="lg:col-span-2 card-enterprise flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#146C43] border border-emerald-200 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#18181B]">Reservations Master Report</h4>
            <p className="text-xs text-[#6B7280] mt-1">
              Exports all reservation requests, assigned vehicles, drivers, level 1/2 approval status, location site, and schedule timestamps based on active date range and site filters.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#ECECE8]">
            <button
              onClick={handleExportReservations}
              disabled={downloading}
              className="btn-primary w-full justify-center py-3 text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Generating Excel file...' : 'Export to Excel (.xlsx)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
