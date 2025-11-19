/**
 * Go Exec Status Modal Component
 * Allows updating Go Exec status, payment status, and product delivery status
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceOrderService } from '@/services/service-order-service';
import { PlayCircle, AlertCircle, X, CreditCard, Package } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import type { ServiceOrder, GoExecStatus } from '@/types';

interface GoExecStatusModalProps {
  serviceOrder: ServiceOrder;
  onClose: () => void;
  onSuccess?: () => void;
  onRequestDerogation?: () => void;
}

const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUND_REQUIRED', label: 'Refund Required' },
];

const DELIVERY_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'DELAYED', label: 'Delayed' },
  { value: 'FAILED', label: 'Failed' },
];

export default function GoExecStatusModal({
  serviceOrder,
  onClose,
  onSuccess,
  onRequestDerogation,
}: GoExecStatusModalProps) {
  const queryClient = useQueryClient();

  const [goExecStatus, setGoExecStatus] = useState<GoExecStatus>(
    serviceOrder.goExecStatus ?? ('OK' as GoExecStatus)
  );
  const [goExecBlockReason, setGoExecBlockReason] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(
    serviceOrder.paymentStatus || 'PENDING'
  );
  const [productDeliveryStatus, setProductDeliveryStatus] = useState(
    serviceOrder.productDeliveryStatus || 'PENDING'
  );

  const updateMutation = useMutation({
    mutationFn: (data: {
      goExecStatus: GoExecStatus;
      goExecBlockReason?: string;
      paymentStatus?: string;
      productDeliveryStatus?: string;
    }) => serviceOrderService.updateGoExecStatus(serviceOrder.id, data),
    onSuccess: () => {
      toast.success('Go Exec status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['service-order', serviceOrder.id] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update Go Exec status';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (goExecStatus === 'NOK' && !goExecBlockReason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }

    if (goExecStatus === 'NOK' && goExecBlockReason.trim().length < 20) {
      toast.error('Block reason must be at least 20 characters');
      return;
    }

    updateMutation.mutate({
      goExecStatus,
      goExecBlockReason: goExecStatus === 'NOK' ? goExecBlockReason.trim() : undefined,
      paymentStatus,
      productDeliveryStatus,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: GoExecStatus) => {
    switch (status) {
      case 'OK':
        return 'bg-green-50 border-green-500 text-green-700';
      case 'NOK':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'DEROGATION':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
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
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-purple-600" />
              Update Go Exec Status
            </h2>
            <p className="text-sm text-gray-600 mt-1">{serviceOrder.externalId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={updateMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Status Info */}
          {serviceOrder.goExecStatus && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Current Status</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Go Exec: <span className="font-semibold">{serviceOrder.goExecStatus}</span>
                    {serviceOrder.goExecBlockReason && (
                      <span className="block mt-1 text-xs">
                        Reason: {serviceOrder.goExecBlockReason}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Go Exec Status Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Go Exec Status *
            </label>
            <div className="space-y-2">
              {(['OK', 'NOK'] as GoExecStatus[]).map((status) => (
                <label
                  key={status}
                  className={clsx(
                    'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                    goExecStatus === status
                      ? getStatusColor(status)
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="goExecStatus"
                    value={status}
                    checked={goExecStatus === status}
                    onChange={(e) => setGoExecStatus(e.target.value as GoExecStatus)}
                    className="w-4 h-4"
                    disabled={updateMutation.isPending}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {status === 'OK' && '✓ OK - Ready to Execute'}
                      {status === 'NOK' && '✗ NOK - Blocked'}
                    </div>
                    <div className="text-xs mt-1">
                      {status === 'OK' &&
                        'All conditions met. Service order can proceed to execution.'}
                      {status === 'NOK' &&
                        'Conditions not met. Service order is blocked from execution.'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Block Reason (only shown when NOK) */}
          {goExecStatus === 'NOK' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block Reason *
              </label>
              <textarea
                value={goExecBlockReason}
                onChange={(e) => setGoExecBlockReason(e.target.value)}
                className="input w-full"
                placeholder="Provide detailed reason for blocking (minimum 20 characters)..."
                rows={4}
                maxLength={500}
                disabled={updateMutation.isPending}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Minimum 20 characters</p>
                <p
                  className={clsx(
                    'text-xs',
                    goExecBlockReason.length < 20 ? 'text-red-500' : 'text-gray-500'
                  )}
                >
                  {goExecBlockReason.length}/500
                </p>
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="input w-full"
              disabled={updateMutation.isPending}
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product Delivery Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-2" />
              Product Delivery Status
            </label>
            <select
              value={productDeliveryStatus}
              onChange={(e) => setProductDeliveryStatus(e.target.value)}
              className="input w-full"
              disabled={updateMutation.isPending}
            >
              {DELIVERY_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Derogation Option */}
          {goExecStatus === 'NOK' && onRequestDerogation && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Need to Override?</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    If this service order must proceed despite being blocked, you can request a
                    derogation (override) with management approval.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestDerogation();
                    }}
                    className="btn btn-warning text-sm mt-3"
                  >
                    Request Derogation Override
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                (goExecStatus === 'NOK' &&
                  (!goExecBlockReason.trim() || goExecBlockReason.trim().length < 20)) ||
                updateMutation.isPending
              }
              className={clsx(
                'btn',
                goExecStatus === 'OK' ? 'btn-success' : 'btn-danger'
              )}
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Update Go Exec Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
