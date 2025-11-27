/**
 * Customer Status Page
 * Shows current service order status and timeline
 */

import {
  Clock,
  CheckCircle,
  Truck,
  User,
  Calendar,
  Phone,
  MapPin,
  MessageCircle,
  Star,
} from 'lucide-react';
import clsx from 'clsx';

interface ServiceOrder {
  id: string;
  state: string;
  service: {
    name: string;
    category: string;
  };
  scheduledDate: string | null;
  scheduledTime: string | null;
  provider?: {
    name: string;
    phone: string;
    rating: number;
  };
  technician?: {
    name: string;
    phone: string;
    avatar?: string;
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  timeline: Array<{
    state: string;
    timestamp: string;
    description: string;
  }>;
}

const mockServiceOrder: ServiceOrder = {
  id: 'SO-2024-001',
  state: 'IN_PROGRESS',
  service: {
    name: 'Installation électrique complète',
    category: 'Électricité',
  },
  scheduledDate: '2025-11-28',
  scheduledTime: '09:00',
  provider: {
    name: 'Électricité Pro Paris',
    phone: '01 23 45 67 89',
    rating: 4.8,
  },
  technician: {
    name: 'Marc Lefebvre',
    phone: '06 12 34 56 78',
  },
  address: {
    street: '15 Rue de la Paix',
    postalCode: '75015',
    city: 'Paris',
  },
  timeline: [
    { state: 'CREATED', timestamp: '2025-11-20 10:30', description: 'Service request created' },
    { state: 'SCHEDULED', timestamp: '2025-11-21 14:15', description: 'Appointment scheduled' },
    { state: 'ASSIGNED', timestamp: '2025-11-22 09:00', description: 'Technician assigned' },
    { state: 'ACCEPTED', timestamp: '2025-11-22 09:30', description: 'Provider confirmed' },
    { state: 'IN_PROGRESS', timestamp: '2025-11-28 09:05', description: 'Work started' },
  ],
};

const stateConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  CREATED: { label: 'Request Created', color: 'text-gray-600', icon: Clock },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-600', icon: Calendar },
  ASSIGNED: { label: 'Technician Assigned', color: 'text-indigo-600', icon: User },
  ACCEPTED: { label: 'Confirmed', color: 'text-purple-600', icon: CheckCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-600', icon: Truck },
  COMPLETED: { label: 'Completed', color: 'text-green-600', icon: CheckCircle },
  VALIDATED: { label: 'Validated', color: 'text-green-700', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'text-gray-700', icon: CheckCircle },
};

const stateOrder = ['CREATED', 'SCHEDULED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'VALIDATED', 'CLOSED'];

function ProgressBar({ currentState }: { currentState: string }) {
  const currentIndex = stateOrder.indexOf(currentState);
  const progress = ((currentIndex + 1) / stateOrder.length) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-green-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function TimelineItem({ 
  state, 
  timestamp, 
  description,
  isLast,
  isCompleted,
  isCurrent,
}: { 
  state: string;
  timestamp: string;
  description: string;
  isLast: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  const config = stateConfig[state] || { label: state, color: 'text-gray-600', icon: Clock };
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isCurrent ? 'bg-green-100 ring-4 ring-green-50' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
        )}>
          <Icon className={clsx('w-5 h-5', isCurrent ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-400')} />
        </div>
        {!isLast && (
          <div className={clsx('w-0.5 flex-1 my-2', isCompleted ? 'bg-green-300' : 'bg-gray-200')} />
        )}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2">
          <span className={clsx('font-medium', isCurrent ? 'text-green-700' : 'text-gray-900')}>
            {config.label}
          </span>
          {isCurrent && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">
              Current
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
      </div>
    </div>
  );
}

export default function CustomerStatusPage() {
  const serviceOrder = mockServiceOrder;
  const currentState = stateConfig[serviceOrder.state];

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Order #{serviceOrder.id}</p>
              <h2 className="text-xl font-semibold mt-0.5">{currentState?.label || serviceOrder.state}</h2>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {currentState && <currentState.icon className="w-6 h-6 text-white" />}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar currentState={serviceOrder.state} />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Service Info */}
          <div>
            <h3 className="font-semibold text-gray-900">{serviceOrder.service.name}</h3>
            <p className="text-sm text-gray-500">{serviceOrder.service.category}</p>
          </div>

          {/* Schedule */}
          {serviceOrder.scheduledDate && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(serviceOrder.scheduledDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <p className="text-sm text-gray-500">at {serviceOrder.scheduledTime}</p>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">{serviceOrder.address.street}</p>
              <p className="text-sm text-gray-500">{serviceOrder.address.postalCode} {serviceOrder.address.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technician Card */}
      {serviceOrder.technician && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Technician</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{serviceOrder.technician.name}</p>
                <p className="text-sm text-gray-500">{serviceOrder.provider?.name}</p>
                {serviceOrder.provider?.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{serviceOrder.provider.rating}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href={`tel:${serviceOrder.technician.phone}`}
                className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Service Timeline</h3>
        <div>
          {serviceOrder.timeline.map((event, index) => (
            <TimelineItem
              key={index}
              state={event.state}
              timestamp={event.timestamp}
              description={event.description}
              isLast={index === serviceOrder.timeline.length - 1}
              isCompleted={stateOrder.indexOf(event.state) <= stateOrder.indexOf(serviceOrder.state)}
              isCurrent={event.state === serviceOrder.state}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Reschedule</span>
        </button>
        <button className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Contact Us</span>
        </button>
      </div>
    </div>
  );
}
