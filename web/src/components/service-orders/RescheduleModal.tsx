/**
 * Reschedule Modal Component
 * Allows rescheduling service orders with notification options
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceOrderService } from '@/services/service-order-service';
import { Calendar, Clock, AlertCircle, Bell, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfDay } from 'date-fns';
import clsx from 'clsx';
import type { ServiceOrder } from '@/types';

interface RescheduleModalProps {
  serviceOrder: ServiceOrder;
  onClose: () => void;
  onSuccess?: () => void;
}

type TimeSlot = 'AM' | 'PM';

const RESCHEDULE_REASONS = [
  { value: 'customer_request', label: 'Customer requested different date' },
  { value: 'provider_unavailable', label: 'Provider unavailable' },
  { value: 'weather_conditions', label: 'Weather conditions' },
  { value: 'materials_delay', label: 'Materials not delivered on time' },
  { value: 'technical_issue', label: 'Technical issue or dependency' },
  { value: 'other', label: 'Other reason' },
];

export default function RescheduleModal({
  serviceOrder,
  onClose,
  onSuccess,
}: RescheduleModalProps) {
  const queryClient = useQueryClient();
  const today = startOfDay(new Date());
  const currentScheduledDate = serviceOrder.scheduledDate
    ? new Date(serviceOrder.scheduledDate)
    : null;

  const [newDate, setNewDate] = useState(
    currentScheduledDate
      ? format(currentScheduledDate, 'yyyy-MM-dd')
      : format(addDays(today, 1), 'yyyy-MM-dd')
  );
  const [newSlot, setNewSlot] = useState<TimeSlot>('AM');
  const [reason, setReason] = useState('');
  const [reasonCategory, setReasonCategory] = useState('customer_request');
  const [reassignProvider, setReassignProvider] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [notifyProvider, setNotifyProvider] = useState(true);

  const rescheduleMutation = useMutation({
    mutationFn: (data: {
      newDate: string;
      newSlot: TimeSlot;
      reason: string;
      reassignProvider: boolean;
      notifyCustomer: boolean;
      notifyProvider: boolean;
    }) => serviceOrderService.reschedule(serviceOrder.id, data),
    onSuccess: () => {
      toast.success('Service order rescheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['service-order', serviceOrder.id] });
      queryClient.invalidateQueries({ queryKey: ['service-orders'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to reschedule service order';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newDate) {
      toast.error('Please select a new date');
      return;
    }

    const selectedDate = new Date(newDate);
    if (selectedDate < today) {
      toast.error('Cannot reschedule to a past date');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for rescheduling');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }

    rescheduleMutation.mutate({
      newDate,
      newSlot,
      reason: reason.trim(),
      reassignProvider,
      notifyCustomer,
      notifyProvider,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const minDate = format(addDays(today, 1), 'yyyy-MM-dd'); // Tomorrow

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
            <h2 className="text-xl font-semibold text-gray-900">Reschedule Service Order</h2>
            <p className="text-sm text-gray-600 mt-1">{serviceOrder.externalId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={rescheduleMutation.isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Schedule Info */}
          {currentScheduledDate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Current Schedule</p>
                  <p className="text-sm text-blue-800 mt-1">
                    {format(currentScheduledDate, 'EEEE, MMMM d, yyyy')} •{' '}
                    <span className="font-medium">
                      {serviceOrder.scheduledDate?.includes('T09:') ? 'AM' : 'PM'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={minDate}
                  className="input w-full pl-10"
                  disabled={rescheduleMutation.isPending}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Select a future date</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value as TimeSlot)}
                  className="input w-full pl-10"
                  disabled={rescheduleMutation.isPending}
                >
                  <option value="AM">Morning (AM)</option>
                  <option value="PM">Afternoon (PM)</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Choose preferred time slot</p>
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason Category *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="input w-full"
              disabled={rescheduleMutation.isPending}
            >
              {RESCHEDULE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input w-full"
              placeholder="Provide detailed reason for rescheduling (minimum 10 characters)..."
              rows={4}
              maxLength={500}
              disabled={rescheduleMutation.isPending}
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Minimum 10 characters</p>
              <p
                className={clsx(
                  'text-xs',
                  reason.length < 10 ? 'text-red-500' : 'text-gray-500'
                )}
              >
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* Provider Reassignment Option */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reassignProvider}
                onChange={(e) => setReassignProvider(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                disabled={rescheduleMutation.isPending}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Reassign to different provider
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Find a new provider based on availability for the selected date/time
                </p>
              </div>
            </label>
          </div>

          {/* Notification Options */}
          <div className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-900">Notification Options</h4>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                disabled={rescheduleMutation.isPending}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Notify customer</span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Send email and SMS notification to customer about the schedule change
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyProvider}
                onChange={(e) => setNotifyProvider(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                disabled={rescheduleMutation.isPending}
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">Notify provider</span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Send notification to assigned provider{reassignProvider && ' (if keeping current provider)'}
                </p>
              </div>
            </label>
          </div>

          {/* Warning if no notifications */}
          {!notifyCustomer && !notifyProvider && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> No notifications will be sent. You'll need to inform
                  the customer and provider manually.
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={rescheduleMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !newDate ||
                !reason.trim() ||
                reason.trim().length < 10 ||
                rescheduleMutation.isPending
              }
              className="btn btn-primary"
            >
              {rescheduleMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Rescheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Reschedule Service Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
