/**
 * Customer WCF (Work Completion Form) Page
 * Customer signs off on completed work
 */

import { useState, useRef } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  Star,
  PenTool,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import clsx from 'clsx';

const mockWCFData = {
  serviceOrder: {
    id: 'SO-2024-001',
    service: 'Installation électrique complète',
    completedAt: '2025-11-28 14:30',
    technician: 'Marc Lefebvre',
  },
  workItems: [
    { id: '1', description: 'Installation du tableau électrique', status: 'completed' as const },
    { id: '2', description: 'Câblage des prises de courant (x12)', status: 'completed' as const },
    { id: '3', description: 'Installation des interrupteurs (x8)', status: 'completed' as const },
    { id: '4', description: 'Mise à la terre', status: 'completed' as const },
    { id: '5', description: 'Test de conformité NFC 15-100', status: 'completed' as const },
  ],
  photos: [
    { id: '1', url: '/api/placeholder/400/300', caption: 'Tableau avant', type: 'before' as const },
    { id: '2', url: '/api/placeholder/400/300', caption: 'Tableau après', type: 'after' as const },
    { id: '3', url: '/api/placeholder/400/300', caption: 'Prises installées', type: 'after' as const },
  ],
  totalAmount: 450,
  materialsCost: 180,
  laborCost: 270,
};

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
  const [signature, setSignature] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [workItemApprovals, setWorkItemApprovals] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const data = mockWCFData;

  const allItemsApproved = data.workItems.every(item => workItemApprovals[item.id] === true);
  const canSubmit = signature && rating > 0 && allItemsApproved;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    // Simulate API call
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
            <p className="text-sm text-gray-500">Order #{data.serviceOrder.id} • {data.serviceOrder.service}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Completed by:</strong> {data.serviceOrder.technician} on {data.serviceOrder.completedAt}
          </p>
        </div>
      </div>

      {/* Work Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Work Performed</h2>
        <p className="text-sm text-gray-500 mb-4">Please confirm each item was completed to your satisfaction</p>
        
        <div className="space-y-3">
          {data.workItems.map(item => (
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
                  item.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                )} />
                <span className="text-gray-700">{item.description}</span>
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

      {/* Photos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Work Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.photos.map(photo => (
            <div key={photo.id} className="relative group">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-8 h-8" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <span className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  photo.type === 'before' ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'
                )}>
                  {photo.type === 'before' ? 'Before' : 'After'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Cost Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Materials</span>
            <span>€{data.materialsCost}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Labor</span>
            <span>€{data.laborCost}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-xl text-gray-900">€{data.totalAmount}</span>
          </div>
        </div>
      </div>

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
          Please approve all work items, add a rating, and sign above to submit.
        </p>
      )}
    </div>
  );
}
