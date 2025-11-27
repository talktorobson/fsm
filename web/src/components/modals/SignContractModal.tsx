/**
 * Sign Contract Modal
 * Digital signature for service contracts
 */

import { useState, useRef, useEffect } from 'react';
import { FileText, CheckCircle2, AlertTriangle, Trash2, Pen } from 'lucide-react';
import ModalContainer from './ModalContainer';
import clsx from 'clsx';

interface ContractInfo {
  id: string;
  serviceOrderRef: string;
  customerName: string;
  serviceType: string;
  totalAmount: number;
  currency: string;
  terms: string[];
  createdAt: string;
}

interface SignContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractInfo;
  onSign: (signatureData: string, signerName: string) => Promise<void>;
}

export default function SignContractModal({
  isOpen,
  onClose,
  contract,
  onSign,
}: SignContractModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // Higher resolution
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!hasSignature || !signerName || !agreedToTerms) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSubmitting(true);
    try {
      const signatureData = canvas.toDataURL('image/png');
      await onSign(signatureData, signerName);
      onClose();
    } catch (error) {
      console.error('Failed to sign contract:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = hasSignature && signerName && agreedToTerms;

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Sign Contract"
      subtitle={`Service Order: ${contract.serviceOrderRef}`}
      size="lg"
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
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Signing...' : 'Sign Contract'}
          </button>
        </>
      }
    >
      {/* Contract Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Service Contract</h3>
            <p className="text-sm text-gray-600 mt-1">
              Customer: {contract.customerName}
            </p>
            <p className="text-sm text-gray-600">
              Service: {contract.serviceType}
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {contract.currency} {contract.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Terms & Conditions</h4>
        <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-y-auto">
          <ul className="space-y-2 text-sm text-gray-600">
            {contract.terms.map((term, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Signer Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name (as it appears on ID) *
        </label>
        <input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Enter your full legal name"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
        />
      </div>

      {/* Signature Pad */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Pen className="w-4 h-4" />
            Signature *
          </label>
          {hasSignature && (
            <button
              onClick={clearSignature}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={clsx(
              'w-full h-32 border-2 rounded-xl cursor-crosshair touch-none',
              hasSignature ? 'border-green-500 bg-green-50/30' : 'border-gray-300 bg-gray-50'
            )}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Draw your signature here</p>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-sm text-gray-600">
          I have read and agree to the terms and conditions. I understand that this electronic
          signature is legally binding.
        </span>
      </label>

      {/* Legal Notice */}
      <div className="flex items-start gap-3 mt-6 p-4 bg-yellow-50 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Legal Notice</p>
          <p className="mt-1 text-yellow-700">
            By signing this contract, you agree to the service terms and authorize the provider
            to perform the specified work.
          </p>
        </div>
      </div>
    </ModalContainer>
  );
}
