/**
 * Service Journey Timeline Component
 * Visual representation of service order FSM state progression
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import { 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Truck,
  ClipboardCheck,
  CreditCard,
  Play,
  Pause,
  Ban,
  ArrowRight
} from 'lucide-react';

// Service Order States based on FSM
type ServiceOrderState = 
  | 'DRAFT'
  | 'NEW'
  | 'PENDING_ASSIGNMENT'
  | 'PENDING_ACCEPTANCE'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_TRANSIT'
  | 'IN_PROGRESS'
  | 'PENDING_PARTS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'PENDING_WCF'
  | 'PENDING_INVOICE'
  | 'INVOICED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'ON_HOLD';

interface TimelineEvent {
  id: string;
  state: ServiceOrderState;
  timestamp: string;
  actor?: string;
  notes?: string;
}

interface ServiceJourneyTimelineProps {
  currentState: ServiceOrderState;
  events?: TimelineEvent[];
  onStateClick?: (state: ServiceOrderState) => void;
}

// Define the standard flow for service orders
const standardFlow: ServiceOrderState[] = [
  'NEW',
  'PENDING_ASSIGNMENT',
  'ASSIGNED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'PENDING_WCF',
  'INVOICED',
  'CLOSED',
];

// State metadata
const stateConfig: Record<ServiceOrderState, {
  label: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  DRAFT: {
    label: 'Draft',
    icon: FileText,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Service order is being created',
  },
  NEW: {
    label: 'New',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    description: 'Service order received',
  },
  PENDING_ASSIGNMENT: {
    label: 'Pending Assignment',
    icon: Users,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    description: 'Awaiting provider assignment',
  },
  PENDING_ACCEPTANCE: {
    label: 'Pending Acceptance',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    description: 'Waiting for provider to accept',
  },
  ASSIGNED: {
    label: 'Assigned',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-400',
    description: 'Provider assigned',
  },
  SCHEDULED: {
    label: 'Scheduled',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    description: 'Appointment scheduled',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    icon: Truck,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-400',
    description: 'Technician on the way',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    description: 'Work in progress',
  },
  PENDING_PARTS: {
    label: 'Pending Parts',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
    description: 'Waiting for parts',
  },
  PAUSED: {
    label: 'Paused',
    icon: Pause,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    description: 'Work temporarily paused',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    description: 'Work completed',
  },
  PENDING_WCF: {
    label: 'Pending WCF',
    icon: ClipboardCheck,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-400',
    description: 'Awaiting work completion form',
  },
  PENDING_INVOICE: {
    label: 'Pending Invoice',
    icon: CreditCard,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-400',
    description: 'Invoice pending',
  },
  INVOICED: {
    label: 'Invoiced',
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-400',
    description: 'Invoice sent',
  },
  CLOSED: {
    label: 'Closed',
    icon: CheckCircle2,
    color: 'text-gray-600',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-400',
    description: 'Order closed',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    description: 'Order cancelled',
  },
  ON_HOLD: {
    label: 'On Hold',
    icon: Ban,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    description: 'Order on hold',
  },
};

export default function ServiceJourneyTimeline({
  currentState,
  events = [],
  onStateClick,
}: ServiceJourneyTimelineProps) {
  // Determine which states to show based on the flow
  const displayStates = useMemo(() => {
    // For cancelled or on-hold, show a simplified view
    if (currentState === 'CANCELLED' || currentState === 'ON_HOLD') {
      const passedStates = events.map(e => e.state).filter(s => standardFlow.includes(s));
      return [...passedStates.slice(0, -1), currentState];
    }
    return standardFlow;
  }, [currentState, events]);

  // Find the current state index in the flow
  const currentIndex = useMemo(() => {
    return displayStates.findIndex(s => s === currentState);
  }, [displayStates, currentState]);

  // Get event for a specific state
  const getEventForState = (state: ServiceOrderState) => {
    return events.find(e => e.state === state);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Journey</h3>
      
      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
          style={{ 
            width: `${Math.max(0, (currentIndex / (displayStates.length - 1)) * 100)}%` 
          }}
        />

        {/* State Nodes */}
        <div className="relative flex justify-between">
          {displayStates.map((state, index) => {
            const config = stateConfig[state];
            const Icon = config.icon;
            const event = getEventForState(state);
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div
                key={state}
                className="flex flex-col items-center"
                style={{ width: `${100 / displayStates.length}%` }}
              >
                {/* Node */}
                <button
                  onClick={() => onStateClick?.(state)}
                  disabled={!onStateClick}
                  className={clsx(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    'border-2',
                    isCurrent && [config.bgColor, config.borderColor, 'ring-4 ring-blue-100'],
                    isPast && 'bg-blue-500 border-blue-500 text-white',
                    isFuture && 'bg-white border-gray-300 text-gray-400',
                    onStateClick && 'cursor-pointer hover:scale-110'
                  )}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className={clsx('w-5 h-5', isCurrent && config.color)} />
                  )}
                  
                  {/* Pulse animation for current state */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-25" />
                  )}
                </button>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p className={clsx(
                    'text-xs font-medium',
                    isCurrent ? 'text-blue-600' : isPast ? 'text-gray-700' : 'text-gray-400'
                  )}>
                    {config.label}
                  </p>
                  {event && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current State Details */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            stateConfig[currentState].bgColor
          )}>
            {(() => {
              const Icon = stateConfig[currentState].icon;
              return <Icon className={clsx('w-6 h-6', stateConfig[currentState].color)} />;
            })()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {stateConfig[currentState].label}
              </h4>
              <span className={clsx(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                stateConfig[currentState].bgColor,
                stateConfig[currentState].color
              )}>
                Current
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stateConfig[currentState].description}
            </p>
            {events.find(e => e.state === currentState)?.notes && (
              <p className="text-xs text-gray-500 mt-2 italic">
                "{events.find(e => e.state === currentState)?.notes}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {events.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.slice(0, 5).map((event) => {
              const config = stateConfig[event.state];
              const Icon = config.icon;
              return (
                <div 
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                    <Icon className={clsx('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{config.label}</p>
                    {event.notes && (
                      <p className="text-xs text-gray-500 truncate">{event.notes}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Steps Indicator */}
      {currentIndex < displayStates.length - 1 && currentState !== 'CANCELLED' && currentState !== 'ON_HOLD' && (
        <div className="mt-6 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <ArrowRight className="w-4 h-4" />
            <span>Next: <strong>{stateConfig[displayStates[currentIndex + 1]]?.label}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export state config for external use
export { stateConfig, standardFlow };
export type { ServiceOrderState, TimelineEvent };
