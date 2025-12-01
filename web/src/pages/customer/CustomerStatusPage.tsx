/**
 * Customer Status Page
 * Shows current service order status and timeline
 */

import {
  Clock,
  CheckCircle,
  User,
  Calendar,
  Phone,
  MapPin,
  MessageCircle,
  Wrench,
  FileCheck,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useCustomerPortalContext } from '@/hooks/useCustomerAccess';

const stateConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  CREATED: { label: 'Request Created', color: 'text-gray-600', icon: Clock },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-600', icon: Calendar },
  ASSIGNED: { label: 'Technician Assigned', color: 'text-indigo-600', icon: User },
  ACCEPTED: { label: 'Confirmed', color: 'text-purple-600', icon: CheckCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-600', icon: Wrench },
  WORK_COMPLETED: { label: 'Work Completed', color: 'text-green-500', icon: FileCheck },
  COMPLETED: { label: 'Completed', color: 'text-green-600', icon: CheckCircle },
  VALIDATED: { label: 'Validated', color: 'text-green-700', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'text-gray-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', icon: XCircle },
  ON_HOLD: { label: 'On Hold', color: 'text-orange-600', icon: Clock },
};

const stateOrder = ['CREATED', 'SCHEDULED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'WORK_COMPLETED', 'COMPLETED', 'VALIDATED', 'CLOSED'];

function ProgressBar({ currentState }: { currentState: string }) {
  const currentIndex = stateOrder.indexOf(currentState);
  // If state is not in order list (e.g., CANCELLED), show 0 progress
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / stateOrder.length) * 100 : 0;

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
  const config = stateConfig[state] || { label: state.replace(/_/g, ' '), color: 'text-gray-600', icon: Clock };
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
  const { serviceOrder, customer } = useCustomerPortalContext();
  const currentState = stateConfig[serviceOrder.state] || { label: serviceOrder.state.replace(/_/g, ' '), color: 'text-gray-600', icon: Clock };

  // Build timeline from stateHistory
  const timeline = serviceOrder.stateHistory?.map((entry) => ({
    state: entry.state,
    timestamp: new Date(entry.timestamp).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    description: stateConfig[entry.state]?.label || entry.state.replace(/_/g, ' '),
  })) || [
    {
      state: serviceOrder.state,
      timestamp: new Date().toLocaleString('fr-FR'),
      description: currentState.label,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Order #{serviceOrder.orderNumber || serviceOrder.id.substring(0, 8)}</p>
              <h2 className="text-xl font-semibold mt-0.5">{currentState.label}</h2>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <currentState.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar currentState={serviceOrder.state} />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Service Info */}
          <div>
            <h3 className="font-semibold text-gray-900">{serviceOrder.serviceName}</h3>
            <p className="text-sm text-gray-500">{serviceOrder.serviceType?.replace(/_/g, ' ')}</p>
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
                {serviceOrder.scheduledTimeSlot && (
                  <p className="text-sm text-gray-500">Time: {serviceOrder.scheduledTimeSlot}</p>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">{serviceOrder.serviceAddress?.street || 'Address not provided'}</p>
              <p className="text-sm text-gray-500">
                {serviceOrder.serviceAddress?.postalCode} {serviceOrder.serviceAddress?.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Card */}
      {serviceOrder.assignedProvider && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Provider</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{serviceOrder.assignedProvider.name}</p>
                {serviceOrder.assignedWorkTeam && (
                  <p className="text-sm text-gray-500">{serviceOrder.assignedWorkTeam.name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {serviceOrder.assignedProvider.phone && (
                <a 
                  href={`tel:${serviceOrder.assignedProvider.phone}`}
                  className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
              <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info */}
      {customer && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="space-y-2">
            <p className="text-gray-700">{customer.name}</p>
            {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
            {customer.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Service Timeline</h3>
          <div>
            {timeline.map((event, index) => (
              <TimelineItem
                key={index}
                state={event.state}
                timestamp={event.timestamp}
                description={event.description}
                isLast={index === timeline.length - 1}
                isCompleted={stateOrder.indexOf(event.state) <= stateOrder.indexOf(serviceOrder.state)}
                isCurrent={event.state === serviceOrder.state}
              />
            ))}
          </div>
        </div>
      )}

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
