/**
 * Reschedule Modal
 * Allows rescheduling a service order to a new date/time
 */

import { useState } from 'react';
import { Calendar, Clock, Info } from 'lucide-react';
import ModalContainer from './ModalContainer';
import clsx from 'clsx';

interface ServiceOrderInfo {
  id: string;
  reference: string;
  customerName: string;
  serviceType: string;
  currentDate?: string;
  currentTime?: string;
}

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrderInfo;
  onReschedule: (newDate: string, newTime: string, reason: string) => Promise<void>;
}

const rescheduleReasons = [
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'provider_unavailable', label: 'Provider Unavailable' },
  { value: 'product_delay', label: 'Product Delivery Delay' },
  { value: 'weather', label: 'Weather Conditions' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

const timeSlots = [
  { value: '08:00', label: '08:00 - 10:00' },
  { value: '10:00', label: '10:00 - 12:00' },
  { value: '12:00', label: '12:00 - 14:00' },
  { value: '14:00', label: '14:00 - 16:00' },
  { value: '16:00', label: '16:00 - 18:00' },
  { value: '18:00', label: '18:00 - 20:00' },
];

export default function RescheduleModal({
  isOpen,
  onClose,
  serviceOrder,
  onReschedule,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newDate || !newTime || !reason) return;
    
    setIsSubmitting(true);
    try {
      await onReschedule(newDate, newTime, reason);
      onClose();
    } catch (error) {
      console.error('Failed to reschedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = newDate && newTime && reason;

  // Calculate minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Service"
      subtitle={`Service Order: ${serviceOrder.reference}`}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </>
      }
    >
      {/* Current Schedule */}
      {serviceOrder.currentDate && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Schedule</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{new Date(serviceOrder.currentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            {serviceOrder.currentTime && (
              <div className="flex items-center gap-2 text-gray-900">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{serviceOrder.currentTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Date Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Date *
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={minDate}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Slot *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => setNewTime(slot.value)}
                className={clsx(
                  'px-3 py-2 text-sm rounded-lg border-2 transition-all',
                  newTime === slot.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Rescheduling *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="">Select a reason</option>
            {rescheduleReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any relevant notes about this rescheduling..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 mt-6 p-4 bg-blue-50 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Customer Notification</p>
          <p className="mt-1 text-blue-700">
            The customer will be automatically notified of this change via email and SMS.
          </p>
        </div>
      </div>
    </ModalContainer>
  );
}
