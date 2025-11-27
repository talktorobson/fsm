/**
 * Customer Contract Page
 * View and sign service contract
 */

import { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  AlertCircle,
  Shield,
  Clock,
  Euro,
} from 'lucide-react';
import clsx from 'clsx';

interface ContractSection {
  id: string;
  title: string;
  content: string;
  expanded: boolean;
}

const contractData = {
  id: 'CTR-2025-001234',
  serviceOrder: 'SO-2025-001234',
  createdDate: '2025-11-15',
  customerName: 'Jean Dupont',
  customerAddress: '45 Rue de la République, 69001 Lyon',
  providerName: 'Électricité Plus SARL',
  serviceType: 'Electrical Panel Upgrade',
  estimatedAmount: 1250.00,
  warranty: '2 years',
  paymentTerms: 'AHS financing - 36 months',
  status: 'pending_signature' as const,
};

const contractSections: ContractSection[] = [
  {
    id: 'scope',
    title: 'Scope of Work',
    content: `The Provider agrees to perform the following services at the Customer's premises:

1. Complete replacement of existing electrical panel
2. Installation of new NFC 15-100 compliant circuit breakers
3. Upgrade of main electrical supply capacity
4. Safety inspection and certification
5. Disposal of old equipment in accordance with environmental regulations

All work will be performed by qualified and certified electricians in compliance with French electrical standards (NFC 15-100).`,
    expanded: true,
  },
  {
    id: 'pricing',
    title: 'Pricing & Payment',
    content: `Total Estimated Cost: €1,250.00 (including VAT)

Payment Schedule:
- Deposit: €0 (financed through AHS program)
- Monthly payments: €34.72 x 36 months
- Interest rate: 0% APR

Payment will be collected automatically via direct debit on the 5th of each month following service completion.

Note: Final amount may vary based on actual work performed. Any additional costs exceeding €100 will require prior customer approval.`,
    expanded: false,
  },
  {
    id: 'warranty',
    title: 'Warranty & Guarantees',
    content: `Warranty Coverage:
- Equipment warranty: 2 years from installation date
- Workmanship warranty: 2 years from installation date
- AHS quality guarantee: 10-year insurance backup

The warranty covers:
- Defects in materials and workmanship
- Electrical failures due to installation issues
- Safety-related concerns

The warranty does not cover:
- Damage caused by misuse or unauthorized modifications
- Normal wear and tear
- Force majeure events`,
    expanded: false,
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    content: `1. Scheduling: The Customer agrees to be present (or designate an adult representative) during the scheduled service window.

2. Access: The Customer will provide clear access to the electrical panel and work areas.

3. Cancellation: Free cancellation up to 48 hours before the appointment. Cancellations within 48 hours may incur a €50 fee.

4. Liability: The Provider maintains comprehensive liability insurance covering up to €1,000,000 for property damage.

5. Dispute Resolution: Any disputes will be resolved through AHS mediation before legal proceedings.

6. Data Protection: Customer data is protected under GDPR regulations. See our privacy policy for details.`,
    expanded: false,
  },
];

export default function CustomerContractPage() {
  const [sections, setSections] = useState(contractSections);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, expanded: !section.expanded } : section
    ));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!agreedToTerms || (!hasSignature && !signature)) return;
    
    setIsSigning(true);
    setTimeout(() => {
      setSigned(true);
      setIsSigning(false);
    }, 1500);
  };

  if (signed) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contract Signed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing. Your service is now confirmed.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500">Contract Reference</div>
            <div className="font-mono font-semibold text-gray-900">{contractData.id}</div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5" />
              Download Signed Contract (PDF)
            </button>
            <p className="text-sm text-gray-500">
              A copy has also been sent to your email
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>You'll receive confirmation via SMS and email</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>The provider will contact you 24h before the appointment</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Track your service status anytime from this portal</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Service Contract</h1>
            <p className="text-sm text-gray-500">Reference: {contractData.id}</p>
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Euro className="w-4 h-4" />
              <span>Total Amount</span>
            </div>
            <div className="font-semibold text-gray-900">€{contractData.estimatedAmount.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Shield className="w-4 h-4" />
              <span>Warranty</span>
            </div>
            <div className="font-semibold text-gray-900">{contractData.warranty}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span>Payment</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm">{contractData.paymentTerms}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <FileText className="w-4 h-4" />
              <span>Service</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm">{contractData.serviceType}</div>
          </div>
        </div>
      </div>

      {/* Contract Sections */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {sections.map((section, idx) => (
          <div key={section.id} className={clsx(idx > 0 && 'border-t border-gray-100')}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{section.title}</span>
              {section.expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {section.expanded && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Download Full Contract */}
      <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
        <Download className="w-5 h-5" />
        Download Full Contract (PDF)
      </button>

      {/* Signature Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Sign Contract</h2>

        {/* Agreement Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-0.5"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the terms and conditions outlined in this contract. 
            I understand that signing this document is legally binding.
          </span>
        </label>

        {/* Signature Canvas */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Your Signature</label>
            {hasSignature && (
              <button
                onClick={clearSignature}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              width={350}
              height={150}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            Draw your signature above
          </p>
        </div>

        {/* Or Type Signature */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Or type your full name</label>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={contractData.customerName}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-serif text-lg"
          />
        </div>

        {/* Warning */}
        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              By signing this contract, you authorize AHS and the provider to proceed with the scheduled service. 
              Your electronic signature has the same legal validity as a handwritten signature.
            </p>
          </div>
        </div>

        {/* Sign Button */}
        <button
          onClick={handleSign}
          disabled={!agreedToTerms || (!hasSignature && !signature) || isSigning}
          className={clsx(
            'w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
            agreedToTerms && (hasSignature || signature)
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSigning ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Sign Contract
            </>
          )}
        </button>
      </div>
    </div>
  );
}
