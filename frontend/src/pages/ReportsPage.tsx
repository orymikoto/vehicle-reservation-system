import React, { useState } from 'react';
import api from '../services/api';
import { FileSpreadsheet, Download } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleExportReservations = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/reports/reservations/export', {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reservation Excel Report */}
        <div className="card-enterprise flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#146C43] border border-emerald-200 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#18181B]">Reservations Master Report</h4>
            <p className="text-xs text-[#6B7280] mt-1">
              Exports all reservation requests, assigned vehicles, drivers, level 1/2 approval status, and timestamps.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#ECECE8]">
            <button
              onClick={handleExportReservations}
              disabled={downloading}
              className="btn-primary w-full justify-center"
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
