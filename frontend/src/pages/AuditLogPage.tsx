import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ActivityLog } from '../types';
import { History, ShieldCheck } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6E6E2] rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#18181B]">System Activity Audit Trail</h3>
          <p className="text-xs text-[#6B7280]">
            Immutable record of all login events, reservation creations, approvals, and vehicle assignments
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#146C43] border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Spatie Audit Active</span>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Causer (User)</th>
              <th className="py-3 px-4">Action Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-[#6B7280]">
                  Loading activity log audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-[#6B7280]">
                  No activity logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-[#6B7280]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#18181B] flex items-center gap-2">
                    <History className="w-4 h-4 text-[#146C43]" />
                    {log.causer?.name || 'System / Guest'}
                  </td>
                  <td className="py-3 px-4 text-[#18181B] font-medium">{log.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
