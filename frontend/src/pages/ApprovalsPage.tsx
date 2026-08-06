import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ReservationApproval } from '../types';
import { Modal } from '../components/Modal';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<ReservationApproval[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Approval Step for Action
  const [selectedApproval, setSelectedApproval] = useState<ReservationApproval | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const res = await api.get('/approvals/pending');
      setApprovals(res.data.data.data || res.data.data);
    } catch (err) {
      console.error('Failed to load pending approvals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (approval: ReservationApproval, type: 'APPROVE' | 'REJECT') => {
    setSelectedApproval(approval);
    setActionType(type);
    setNotes('');
    setError('');
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval || !actionType) return;

    if (actionType === 'REJECT' && !notes.trim()) {
      setError('Rejection notes are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const endpoint =
        actionType === 'APPROVE'
          ? `/approvals/${selectedApproval.id}/approve`
          : `/approvals/${selectedApproval.id}/reject`;

      await api.post(endpoint, { notes });

      setSelectedApproval(null);
      setActionType(null);
      fetchPendingApprovals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process approval action.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6E6E2] rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#18181B]">Approver Inbox</h3>
          <p className="text-xs text-[#6B7280]">
            Review and approve vehicle reservation requests requiring your authorization
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <Clock className="w-4 h-4" />
          <span>{approvals.length} Pending Actions</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E6E6E2] text-xs font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F5F5F3]">
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4">Reservation Code</th>
              <th className="py-3 px-4">Assigned Vehicle</th>
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Purpose & Destination</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECE8] text-sm bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                  Loading pending approvals...
                </td>
              </tr>
            ) : approvals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                  No pending approval requests assigned to you.
                </td>
              </tr>
            ) : (
              approvals.map((app) => (
                <tr key={app.id} className="hover:bg-[#F5F5F3] transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#146C43] text-white">
                      Level {app.approval_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#18181B]">
                    {app.reservation?.reservation_code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#18181B]">
                      {app.reservation?.vehicle?.plate_number}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {app.reservation?.vehicle?.model}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#18181B] font-medium">
                    {app.reservation?.driver?.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#18181B]">{app.reservation?.purpose}</div>
                    <div className="text-xs text-[#6B7280]">{app.reservation?.destination}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenActionModal(app, 'REJECT')}
                        className="btn-danger h-8 text-xs px-3"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(app, 'APPROVE')}
                        className="btn-primary h-8 text-xs px-3"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Approval / Rejection Modal */}
      <Modal
        isOpen={selectedApproval !== null}
        onClose={() => setSelectedApproval(null)}
        title={`${actionType === 'APPROVE' ? 'Approve' : 'Reject'} Reservation Request`}
      >
        <form onSubmit={handleSubmitAction} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-[#F5F5F3] p-4 rounded-lg border border-[#E6E6E2] space-y-1 text-xs">
            <div>
              <span className="font-semibold text-[#6B7280]">Code:</span>{' '}
              <span className="font-bold text-[#18181B]">
                {selectedApproval?.reservation?.reservation_code}
              </span>
            </div>
            <div>
              <span className="font-semibold text-[#6B7280]">Purpose:</span>{' '}
              <span className="text-[#18181B]">{selectedApproval?.reservation?.purpose}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#6B7280] mb-1">
              Remarks / Notes {actionType === 'REJECT' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              rows={3}
              required={actionType === 'REJECT'}
              placeholder={
                actionType === 'REJECT'
                  ? 'State reason for rejection...'
                  : 'Add any optional approval remarks...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#E6E6E2] text-sm focus:outline-none focus:border-[#146C43]"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#ECECE8] pt-4">
            <button
              type="button"
              onClick={() => setSelectedApproval(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={actionType === 'APPROVE' ? 'btn-primary' : 'btn-danger'}
            >
              {submitting
                ? 'Processing...'
                : actionType === 'APPROVE'
                ? 'Confirm Approval'
                : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
