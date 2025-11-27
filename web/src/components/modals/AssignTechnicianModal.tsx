/**
 * Assign Technician Modal
 * Select and assign a professional to a service order
 */

import { useState } from 'react';
import { Star, MapPin, Briefcase, CheckCircle2, Clock, User } from 'lucide-react';
import ModalContainer from './ModalContainer';
import clsx from 'clsx';

interface Technician {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  activeJobs: number;
  availableSlots: number;
  location: string;
  distance?: number;
  avatar?: string;
}

interface ServiceOrderInfo {
  id: string;
  reference: string;
  customerName: string;
  serviceType: string;
  scheduledDate?: string;
  address: string;
}

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrderInfo;
  technicians: Technician[];
  onAssign: (technicianId: string) => Promise<void>;
}

export default function AssignTechnicianModal({
  isOpen,
  onClose,
  serviceOrder,
  technicians,
  onAssign,
}: AssignTechnicianModalProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedTech) return;
    
    setAssigning(true);
    try {
      await onAssign(selectedTech);
      onClose();
    } catch (error) {
      console.error('Failed to assign technician:', error);
    } finally {
      setAssigning(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              'w-3.5 h-3.5',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Professional"
      subtitle={`Service Order: ${serviceOrder.reference}`}
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
            onClick={handleAssign}
            disabled={!selectedTech || assigning}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {assigning ? 'Assigning...' : 'Assign Selected'}
          </button>
        </>
      }
    >
      {/* Service Order Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
            <p className="font-medium text-gray-900">{serviceOrder.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Service Type</p>
            <p className="font-medium text-gray-900">{serviceOrder.serviceType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled Date</p>
            <p className="font-medium text-gray-900">
              {serviceOrder.scheduledDate 
                ? new Date(serviceOrder.scheduledDate).toLocaleDateString()
                : 'Not scheduled'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
            <p className="font-medium text-gray-900 truncate">{serviceOrder.address}</p>
          </div>
        </div>
      </div>

      {/* Technicians List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {technicians.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No available technicians found</p>
          </div>
        ) : (
          technicians.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTech(tech.id)}
              className={clsx(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                selectedTech === tech.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                    {selectedTech === tech.id && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  {renderStars(tech.rating)}

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {tech.location}
                      {tech.distance && ` (${tech.distance} km)`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {tech.activeJobs} active
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {tech.availableSlots} slots free
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tech.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {tech.skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{tech.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </ModalContainer>
  );
}
