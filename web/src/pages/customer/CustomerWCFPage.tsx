/**
 * Customer WCF (Work Completion Form) Page
 * Customer signs off on completed work
 */

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Star,
  PenTool,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useCustomerPortalContext } from '@/hooks/useCustomerAccess';
import { customerPortalService } from '@/services/customer-portal-service';

function SignaturePad({ onSign, signature }: { onSign: (data: string) => void; signature: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSign(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSign('');
      }
    }
  };

  if (signature) {
    return (
      <div className="relative">
        <img src={signature} alt="Your signature" className="border-2 border-green-200 rounded-xl bg-green-50" />
        <button
          onClick={clearSignature}
          className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-crosshair touch-none w-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <p className="text-xs text-gray-500 text-center">Draw your signature above</p>
    </div>
  );
}

export default function CustomerWCFPage() {
  const { accessToken, serviceOrder } = useCustomerPortalContext();
  const [signature, setSignature] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [workItemApprovals, setWorkItemApprovals] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch WCF data from API
  const { data: wcfData, isLoading, error } = useQuery({
    queryKey: ['customer-wcf', accessToken],
    queryFn: () => customerPortalService.getWCFData(accessToken),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading work completion form...</p>
        </div>
      </div>
    );
  }

  if (error || !wcfData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Work Completion Form</h2>
          <p className="text-gray-600">
            The work completion form is not yet available. It will be created after the service is completed.
          </p>
        </div>
      </div>
    );
  }

  const checklistItems = wcfData.checklistItems || [];
  const allItemsApproved = checklistItems.length === 0 || checklistItems.every(item => workItemApprovals[item.id] === true);
  const canSubmit = signature && rating > 0 && allItemsApproved;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    // TODO: Call API to submit WCF signature
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your work completion form has been submitted successfully. 
            You will receive a confirmation email shortly.
          </p>
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={clsx(
                  'w-6 h-6',
                  star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">You rated this service {rating} stars</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Work Completion Form</h1>
            <p className="text-sm text-gray-500">
              Order #{serviceOrder.orderNumber || serviceOrder.id.substring(0, 8)} • {wcfData.serviceOrder.serviceName}
            </p>
          </div>
        </div>
        {wcfData.wcf && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              <strong>Status:</strong> {wcfData.wcf.status?.replace(/_/g, ' ')}
              {wcfData.wcf.signedAt && ` • Signed on ${new Date(wcfData.wcf.signedAt).toLocaleDateString()}`}
            </p>
          </div>
        )}
      </div>

      {/* Work Items / Checklist */}
      {checklistItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Work Performed</h2>
          <p className="text-sm text-gray-500 mb-4">Please confirm each item was completed to your satisfaction</p>
          
          <div className="space-y-3">
            {checklistItems.map(item => (
              <div 
                key={item.id}
                className={clsx(
                  'flex items-center justify-between p-4 rounded-xl border-2 transition-colors',
                  workItemApprovals[item.id] === true 
                    ? 'border-green-200 bg-green-50' 
                    : workItemApprovals[item.id] === false
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className={clsx(
                    'w-5 h-5',
                    workItemApprovals[item.id] === true ? 'text-green-600' : 'text-gray-400'
                  )} />
                  <span className="text-gray-700">{item.text}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWorkItemApprovals(prev => ({ ...prev, [item.id]: true }))}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      workItemApprovals[item.id] === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-600'
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setWorkItemApprovals(prev => ({ ...prev, [item.id]: false }))}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      workItemApprovals[item.id] === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!allItemsApproved && Object.keys(workItemApprovals).length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">
                Please approve all work items before signing. If there are issues, please contact us.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Work Description */}
      {wcfData.wcf?.workDescription && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Work Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{wcfData.wcf.workDescription}</p>
        </div>
      )}

      {/* Rating */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Rate This Service</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={clsx(
                  'w-10 h-10 transition-colors',
                  star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your experience (optional)..."
          className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          rows={3}
        />
      </div>

      {/* Signature */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Your Signature</h2>
        <p className="text-sm text-gray-500 mb-4">
          By signing below, you confirm that the work has been completed to your satisfaction.
        </p>
        <SignaturePad signature={signature} onSign={setSignature} />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={clsx(
          'w-full py-4 rounded-2xl font-semibold text-lg transition-colors flex items-center justify-center gap-2',
          canSubmit
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <PenTool className="w-5 h-5" />
            Sign & Submit
          </>
        )}
      </button>

      {!canSubmit && (
        <p className="text-center text-sm text-gray-500">
          {checklistItems.length > 0 
            ? 'Please approve all work items, add a rating, and sign above to submit.'
            : 'Please add a rating and sign above to submit.'}
        </p>
      )}
    </div>
  );
}
