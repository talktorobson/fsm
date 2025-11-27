/**
 * Work Completion Form Panel
 * Displays WCF details and allows submission/review
 */

import { useState } from 'react';
import clsx from 'clsx';
import {
  ClipboardCheck,
  Camera,
  FileText,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  Plus,
  Star,
} from 'lucide-react';

interface WCFData {
  id?: string;
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED' | 'APPROVED' | 'REJECTED';
  completedAt?: string;
  workDescription?: string;
  materialsUsed?: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  timeSpent?: {
    hours: number;
    minutes: number;
  };
  photos?: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  technician?: {
    id: string;
    name: string;
    signature?: string;
  };
  customer?: {
    name: string;
    signature?: string;
    signedAt?: string;
  };
  rating?: number;
  feedback?: string;
}

interface WCFPanelProps {
  wcf: WCFData | null;
  serviceOrderId: string;
  onCreateWCF: () => void;
  onSubmitWCF: (data: Partial<WCFData>) => Promise<void>;
  onRequestSignature: () => void;
  isEditable?: boolean;
}

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    icon: FileText,
  },
  PENDING_SIGNATURE: {
    label: 'Pending Signature',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    icon: Clock,
  },
  SIGNED: {
    label: 'Signed',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    icon: CheckCircle2,
  },
  APPROVED: {
    label: 'Approved',
    color: 'text-green-600',
    bg: 'bg-green-100',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-600',
    bg: 'bg-red-100',
    icon: AlertTriangle,
  },
};

export default function WCFPanel({
  wcf,
  serviceOrderId: _serviceOrderId,
  onCreateWCF,
  onSubmitWCF,
  onRequestSignature,
  isEditable = false,
}: WCFPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [workDescription, setWorkDescription] = useState(wcf?.workDescription || '');
  const [hours, setHours] = useState(wcf?.timeSpent?.hours || 0);
  const [minutes, setMinutes] = useState(wcf?.timeSpent?.minutes || 0);
  const [materials, setMaterials] = useState(wcf?.materialsUsed || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitWCF({
        workDescription,
        timeSpent: { hours, minutes },
        materialsUsed: materials,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save WCF:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMaterial = () => {
    setMaterials([...materials, { name: '', quantity: 1, unit: 'pcs' }]);
  };

  const updateMaterial = (index: number, field: string, value: string | number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  // No WCF exists yet
  if (!wcf) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Work Completion Form
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a WCF once the work is completed
          </p>
          {isEditable && (
            <button
              onClick={onCreateWCF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create WCF
            </button>
          )}
        </div>
      </div>
    );
  }

  const status = statusConfig[wcf.status];
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', status.bg)}>
              <ClipboardCheck className={clsx('w-5 h-5', status.color)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Work Completion Form</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={clsx(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  status.bg,
                  status.color
                )}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                {wcf.completedAt && (
                  <span className="text-xs text-gray-500">
                    Completed {new Date(wcf.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isEditable && !isEditing && wcf.status === 'DRAFT' && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Work Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Work Description
          </h4>
          {isEditing ? (
            <textarea
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the work performed..."
            />
          ) : (
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {wcf.workDescription || 'No description provided'}
            </p>
          )}
        </div>

        {/* Time Spent */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time Spent
          </h4>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center"
                />
                <span className="text-sm text-gray-500">hours</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center"
                />
                <span className="text-sm text-gray-500">minutes</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {wcf.timeSpent 
                ? `${wcf.timeSpent.hours}h ${wcf.timeSpent.minutes}m`
                : 'Not recorded'}
            </p>
          )}
        </div>

        {/* Materials Used */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Materials Used
            </span>
            {isEditing && (
              <button
                onClick={addMaterial}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + Add Material
              </button>
            )}
          </h4>
          {isEditing ? (
            <div className="space-y-2">
              {materials.map((material, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                    placeholder="Material name"
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => updateMaterial(index, 'quantity', Number(e.target.value))}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center text-sm"
                  />
                  <select
                    value={material.unit}
                    onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="pcs">pcs</option>
                    <option value="m">m</option>
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                  </select>
                  <button
                    onClick={() => removeMaterial(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {materials.length === 0 && (
                <p className="text-sm text-gray-400 italic">No materials added</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {wcf.materialsUsed && wcf.materialsUsed.length > 0 ? (
                wcf.materialsUsed.map((material, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    {material.quantity} {material.unit} - {material.name}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No materials recorded</p>
              )}
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photos ({wcf.photos?.length || 0})
          </h4>
          {wcf.photos && wcf.photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {wcf.photos.map((photo) => (
                <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Work photo'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : isEditing ? (
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">Upload photos</span>
            </button>
          ) : (
            <p className="text-sm text-gray-400 italic">No photos attached</p>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4">
          {/* Technician Signature */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              Technician
            </h5>
            {wcf.technician ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{wcf.technician.name}</p>
                {wcf.technician.signature ? (
                  <div className="mt-2 p-2 bg-white border border-gray-200 rounded h-12">
                    <img src={wcf.technician.signature} alt="Signature" className="h-full" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Not signed</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Not assigned</p>
            )}
          </div>

          {/* Customer Signature */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              Customer
            </h5>
            {wcf.customer?.signature ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{wcf.customer.name}</p>
                <div className="mt-2 p-2 bg-white border border-gray-200 rounded h-12">
                  <img src={wcf.customer.signature} alt="Signature" className="h-full" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Signed {wcf.customer.signedAt && new Date(wcf.customer.signedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400 mb-2">Not signed</p>
                {wcf.status === 'DRAFT' && isEditable && (
                  <button
                    onClick={onRequestSignature}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Request Signature
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Customer Rating */}
        {wcf.rating && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Rating</h4>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={clsx(
                      'w-5 h-5',
                      star <= wcf.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{wcf.rating}/5</span>
            </div>
            {wcf.feedback && (
              <p className="text-sm text-gray-600 mt-2 italic">"{wcf.feedback}"</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {isEditing && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {wcf.status === 'DRAFT' && !isEditing && isEditable && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onRequestSignature}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Request Customer Signature
          </button>
        </div>
      )}
    </div>
  );
}
