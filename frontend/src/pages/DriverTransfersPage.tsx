import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, Users } from 'lucide-react';
import { DriverTransfer, Driver, Location, User as UserType } from '../types';
import api from '../services/api';

interface DriverTransfersPageProps {
  currentUser: UserType;
  selectedLocationId?: string;
}

export const DriverTransfersPage: React.FC<DriverTransfersPageProps> = ({
  currentUser,
  selectedLocationId = '',
}) => {
  const [transfers, setTransfers] = useState<DriverTransfer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [driverId, setDriverId] = useState('');
  const [destinationLocationId, setDestinationLocationId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchFormOptions();
  }, [selectedLocationId]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transfers/drivers', {
        params: { location_id: selectedLocationId },
      });
      setTransfers(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to fetch driver transfers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [dRes, lRes] = await Promise.all([
        api.get('/drivers'),
        api.get('/locations?active_only=true'),
      ]);
      setDrivers(dRes.data.data.data || dRes.data.data);
      setLocations(lRes.data.data);
    } catch (err) {
      console.error('Failed to load form options', err);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverId || !destinationLocationId) return;

    try {
      setActionLoading(true);
      await api.post('/transfers/drivers', {
        driver_id: driverId,
        destination_location_id: destinationLocationId,
        remarks,
      });
      setIsModalOpen(false);
      setDriverId('');
      setDestinationLocationId('');
      setRemarks('');
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate driver transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveOrigin = async (id: string) => {
    try {
      await api.post(`/transfers/drivers/${id}/approve-origin`);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve origin release.');
    }
  };

  const handleApproveDestination = async (id: string) => {
    try {
      await api.post(`/transfers/drivers/${id}/approve-destination`);
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve destination receipt.');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason === null) return;

    try {
      await api.post(`/transfers/drivers/${id}/reject`, { remarks: reason });
      fetchTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject transfer.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ORIGIN':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pending Origin Release</span>;
      case 'PENDING_DESTINATION':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-800 border border-blue-200">Pending Destination Receipt</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Transfer Completed</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-50 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-800 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#18181B]">Driver Transfers</h2>
          <p className="text-xs text-[#6B7280]">Inter-location driver re-assignment history & approvals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-[#146C43] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0F5A37] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Request Driver Transfer
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6B7280] text-sm">Loading driver transfers...</div>
      ) : transfers.length === 0 ? (
        <div className="bg-white border border-[#E6E6E2] rounded-xl p-12 text-center text-[#6B7280]">
          No driver transfers recorded.
        </div>
      ) : (
        <div className="bg-white border border-[#E6E6E2] rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#18181B]">
              <thead className="bg-[#F5F5F3] text-xs font-semibold text-[#6B7280] uppercase tracking-wider border-b border-[#E6E6E2]">
                <tr>
                  <th className="px-6 py-3.5">DRIVER</th>
                  <th className="px-6 py-3.5">ORIGIN LOCATION</th>
                  <th className="px-6 py-3.5">DESTINATION LOCATION</th>
                  <th className="px-6 py-3.5">REQUESTER</th>
                  <th className="px-6 py-3.5">STATUS</th>
                  <th className="px-6 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E2]">
                {transfers.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      <div>{item.driver?.name}</div>
                      <div className="text-xs font-normal text-[#6B7280]">{item.driver?.license_number}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">
                      {item.origin_location?.name} ({item.origin_location?.code})
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#146C43]">
                      {item.destination_location?.name} ({item.destination_location?.code})
                    </td>
                    <td className="px-6 py-4 text-xs text-[#6B7280]">
                      {item.requester?.name}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {item.status === 'PENDING_ORIGIN' && (
                        <>
                          <button
                            onClick={() => handleApproveOrigin(item.id)}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700 transition-colors"
                          >
                            Approve Origin Release
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {item.status === 'PENDING_DESTINATION' && (
                        <>
                          <button
                            onClick={() => handleApproveDestination(item.id)}
                            className="px-3 py-1.5 bg-[#146C43] text-white rounded-md text-xs font-semibold hover:bg-[#0F5A37] transition-colors"
                          >
                            Approve Destination Receipt
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E6E6E2] space-y-4">
            <h3 className="text-lg font-bold text-[#18181B]">Initiate Driver Transfer</h3>
            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Select Driver</label>
                <select
                  required
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full text-sm border border-[#E6E6E2] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.license_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Destination Location</label>
                <select
                  required
                  value={destinationLocationId}
                  onChange={(e) => setDestinationLocationId(e.target.value)}
                  className="w-full text-sm border border-[#E6E6E2] rounded-lg px-3 py-2 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                >
                  <option value="">-- Choose Target Mine Site --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Remarks / Justification</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Reason for transferring driver..."
                  className="w-full text-sm border border-[#E6E6E2] rounded-lg p-3 bg-[#FAFAF8] focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#18181B] border border-[#E6E6E2] rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#146C43] text-white text-sm font-semibold rounded-lg hover:bg-[#0F5A37] transition-colors"
                >
                  {actionLoading ? 'Initiating...' : 'Submit Driver Transfer Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
