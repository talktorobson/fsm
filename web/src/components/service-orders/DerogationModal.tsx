/**
 * Derogation Modal Component
 * Allows requesting Go Exec override (derogation) with management approval
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceOrderService } from '@/services/service-order-service';
import { ShieldAlert, AlertTriangle, X, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import type { ServiceOrder } from '@/types';

interface DerogationModalProps {
  serviceOrder: ServiceOrder;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEROGATION_REASONS = [
  { value: 'urgent_customer_need', label: 'Urgent Customer Need / Emergency' },
  { value: 'payment_pending_confirmed', label: 'Payment Pending but Confirmed' },
  { value: 'delivery_delay_acceptable', label: 'Delivery Delay Acceptable to Customer' },
  { value: 'risk_acceptable', label: 'Identified Risk is Acceptable' },
  { value: 'special_approval', label: 'Special Management Approval' },
  { value: 'other', label: 'Other (specify below)' },
];

export default function DerogationModal({
  serviceOrder,
  onClose,
  onSuccess,
}: DerogationModalProps) {
  const queryClient = useQueryClient();

  const [reasonCategory, setReasonCategory] = useState('urgent_customer_need');
  const [reason, setReason] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  const derogationMutation = useMutation({
    mutationFn: (data: { reason: string; approvedBy: string }) =>
      serviceOrderService.overrideGoExec(serviceOrder.id, data),
    onSuccess: () => {
      toast.success('Derogation approved. Go Exec status set to DEROGATION.');
      queryClient.invalidateQueries({ queryKey: ['service-order', serviceOrder.id] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to process derogation';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!reason.trim()) {
      toast.error('Please provide a detailed reason for derogation');
      return;
    }

    if (reason.trim().length < 30) {
      toast.error('Reason must be at least 30 characters');
      return;
    }

    if (!approvedBy.trim()) {
      toast.error('Please specify who approved this derogation');
      return;
    }

    if (approvedBy.trim().length < 3) {
      toast.error('Approver name must be at least 3 characters');
      return;
    }

    derogationMutation.mutate({
      reason: `[${reasonCategory}] ${reason.trim()}`,
      approvedBy: approvedBy.trim(),
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-yellow-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-yellow-600" />
              Request Go Exec Derogation (Override)
            </h2>
            <p className="text-sm text-gray-600 mt-1">{serviceOrder.externalId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={derogationMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">⚠️ Critical Action</p>
              <p className="text-sm text-red-800 mt-1">
                A <strong>derogation</strong> allows a blocked service order to proceed to execution
                despite failing Go Exec conditions. This requires management approval and will be
                logged in the audit trail.
              </p>
              <p className="text-xs text-red-700 mt-2">
                Use this only when blocking conditions have been reviewed and the risk is acceptable.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Block Status */}
          {serviceOrder.goExecStatus === 'NOK' && serviceOrder.goExecBlockReason && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Current Block Reason:</p>
              <p className="text-sm text-gray-700">{serviceOrder.goExecBlockReason}</p>
            </div>
          )}

          {/* Derogation Reason Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Derogation Category *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="input w-full"
              disabled={derogationMutation.isPending}
            >
              {DEROGATION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Justification *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input w-full"
              placeholder="Provide detailed justification for why this override is necessary (minimum 30 characters)..."
              rows={5}
              maxLength={1000}
              disabled={derogationMutation.isPending}
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Minimum 30 characters</p>
              <p
                className={clsx(
                  'text-xs',
                  reason.length < 30 ? 'text-red-500' : 'text-gray-500'
                )}
              >
                {reason.length}/1000
              </p>
            </div>
          </div>

          {/* Approver Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4 inline mr-2" />
              Approved By (Name or ID) *
            </label>
            <input
              type="text"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
              className="input w-full"
              placeholder="Enter manager name or employee ID who approved this override..."
              maxLength={100}
              disabled={derogationMutation.isPending}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the name or employee ID of the manager who approved this derogation
            </p>
          </div>

          {/* Confirmation Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">What Happens Next?</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Go Exec status will be set to <strong>DEROGATION</strong></li>
              <li>Service order will be unblocked and can proceed to execution</li>
              <li>All details will be logged in the audit trail</li>
              <li>Approver and reason will be visible to all operators</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={derogationMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !reason.trim() ||
                reason.trim().length < 30 ||
                !approvedBy.trim() ||
                approvedBy.trim().length < 3 ||
                derogationMutation.isPending
              }
              className="btn btn-warning"
            >
              {derogationMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Approve Derogation Override
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
