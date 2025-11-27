/**
 * Handle WCF Modal
 * Work Completion Form handling with quality assessment
 */

import { useState } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Camera, FileText, Star } from 'lucide-react';
import ModalContainer from './ModalContainer';
import clsx from 'clsx';

interface WCFInfo {
  id: string;
  serviceOrderRef: string;
  customerName: string;
  providerName: string;
  serviceType: string;
  workDescription: string;
  completedAt: string;
  photos?: string[];
}

interface HandleWCFModalProps {
  isOpen: boolean;
  onClose: () => void;
  wcf: WCFInfo;
  onApprove: (rating: number, notes: string) => Promise<void>;
  onReject: (reason: string, notes: string) => Promise<void>;
}

const qualityRatings = [
  { value: 5, label: 'Excellent', description: 'Work exceeds expectations' },
  { value: 4, label: 'Good', description: 'Work meets all requirements' },
  { value: 3, label: 'Acceptable', description: 'Work meets minimum standards' },
  { value: 2, label: 'Below Standard', description: 'Minor issues need addressing' },
  { value: 1, label: 'Poor', description: 'Significant issues present' },
];

const rejectionReasons = [
  { value: 'incomplete_work', label: 'Work Not Complete' },
  { value: 'quality_issues', label: 'Quality Issues' },
  { value: 'wrong_parts', label: 'Wrong Parts/Materials Used' },
  { value: 'customer_complaint', label: 'Customer Complaint' },
  { value: 'safety_concern', label: 'Safety Concerns' },
  { value: 'documentation_missing', label: 'Documentation Missing' },
  { value: 'other', label: 'Other' },
];

export default function HandleWCFModal({
  isOpen,
  onClose,
  wcf,
  onApprove,
  onReject,
}: HandleWCFModalProps) {
  const [mode, setMode] = useState<'review' | 'approve' | 'reject'>('review');
  const [rating, setRating] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onApprove(rating, notes);
      onClose();
    } catch (error) {
      console.error('Failed to approve WCF:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return;
    
    setIsSubmitting(true);
    try {
      await onReject(rejectionReason, notes);
      onClose();
    } catch (error) {
      console.error('Failed to reject WCF:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={clsx(
              'transition-colors',
              interactive && 'hover:scale-110 cursor-pointer'
            )}
          >
            <Star
              className={clsx(
                'w-6 h-6',
                star <= (interactive ? rating : count)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderReviewMode = () => (
    <>
      {/* WCF Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Work Completion Form</h3>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{wcf.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Provider</p>
                <p className="font-medium text-gray-900">{wcf.providerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Service Type</p>
                <p className="font-medium text-gray-900">{wcf.serviceType}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="font-medium text-gray-900">
                  {new Date(wcf.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Description */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Work Description
        </h4>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-700">{wcf.workDescription}</p>
        </div>
      </div>

      {/* Photos */}
      {wcf.photos && wcf.photos.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photos ({wcf.photos.length})
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {wcf.photos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={photo}
                  alt={`Work photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setMode('reject')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
        >
          <XCircle className="w-5 h-5" />
          Reject with Issues
        </button>
        <button
          onClick={() => setMode('approve')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <CheckCircle2 className="w-5 h-5" />
          Approve Work
        </button>
      </div>
    </>
  );

  const renderApproveMode = () => (
    <>
      <button
        onClick={() => setMode('review')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Back to review
      </button>

      {/* Quality Rating */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Assessment *</h4>
        <div className="space-y-2">
          {qualityRatings.map((r) => (
            <button
              key={r.value}
              onClick={() => setRating(r.value)}
              className={clsx(
                'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all',
                rating === r.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                {renderStars(r.value)}
                <span className="font-medium text-gray-900">{r.label}</span>
              </div>
              <span className="text-sm text-gray-500">{r.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional comments about the work quality..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
        />
      </div>

      <button
        onClick={handleApprove}
        disabled={rating === 0 || isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <CheckCircle2 className="w-5 h-5" />
        {isSubmitting ? 'Approving...' : 'Approve Work Completion'}
      </button>
    </>
  );

  const renderRejectMode = () => (
    <>
      <button
        onClick={() => setMode('review')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Back to review
      </button>

      {/* Warning */}
      <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-medium">Rejection Notice</p>
          <p className="mt-1 text-red-700">
            Rejecting this WCF will notify the provider and may require rework.
          </p>
        </div>
      </div>

      {/* Rejection Reason */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Rejection *
        </label>
        <select
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          <option value="">Select a reason</option>
          {rejectionReasons.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Explanation *
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Please provide specific details about the issues found..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
        />
      </div>

      <button
        onClick={handleReject}
        disabled={!rejectionReason || !notes || isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <XCircle className="w-5 h-5" />
        {isSubmitting ? 'Rejecting...' : 'Reject Work Completion'}
      </button>
    </>
  );

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'review' ? 'Review Work Completion' : mode === 'approve' ? 'Approve Work' : 'Reject Work'}
      subtitle={`Service Order: ${wcf.serviceOrderRef}`}
      size="lg"
    >
      {mode === 'review' && renderReviewMode()}
      {mode === 'approve' && renderApproveMode()}
      {mode === 'reject' && renderRejectMode()}
    </ModalContainer>
  );
}
