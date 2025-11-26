/**
 * Critical Actions Panel
 * Displays urgent items requiring immediate attention
 * (Contract Not Signed, Pro No-Show, WCF Pending, etc.)
 */

import { AlertTriangle, FileText, UserX, Clock, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export type CriticalActionType = 
  | 'contract_not_signed'
  | 'pro_no_show'
  | 'wcf_pending'
  | 'customer_complaint'
  | 'payment_overdue'
  | 'scheduling_conflict';

export interface CriticalAction {
  id: string;
  type: CriticalActionType;
  title: string;
  description: string;
  serviceOrderId?: string;
  serviceOrderRef?: string;
  customerId?: string;
  customerName?: string;
  providerId?: string;
  providerName?: string;
  dueTime?: string;
  createdAt: string;
  priority: 'critical' | 'high' | 'medium';
}

interface CriticalActionsPanelProps {
  actions: CriticalAction[];
  onActionClick?: (action: CriticalAction) => void;
  onViewAll?: () => void;
  loading?: boolean;
  maxItems?: number;
}

const actionTypeConfig: Record<CriticalActionType, { icon: typeof AlertTriangle; label: string; color: string }> = {
  contract_not_signed: { 
    icon: FileText, 
    label: 'Contract Not Signed', 
    color: 'bg-red-500' 
  },
  pro_no_show: { 
    icon: UserX, 
    label: 'Pro No-Show', 
    color: 'bg-orange-500' 
  },
  wcf_pending: { 
    icon: Clock, 
    label: 'WCF Pending', 
    color: 'bg-yellow-500' 
  },
  customer_complaint: { 
    icon: AlertTriangle, 
    label: 'Customer Complaint', 
    color: 'bg-red-600' 
  },
  payment_overdue: { 
    icon: AlertTriangle, 
    label: 'Payment Overdue', 
    color: 'bg-red-400' 
  },
  scheduling_conflict: { 
    icon: Clock, 
    label: 'Scheduling Conflict', 
    color: 'bg-amber-500' 
  },
};

const priorityStyles: Record<CriticalAction['priority'], string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
};

export default function CriticalActionsPanel({
  actions,
  onActionClick,
  onViewAll,
  loading = false,
  maxItems = 5,
}: CriticalActionsPanelProps) {
  const displayedActions = actions.slice(0, maxItems);
  const hasMore = actions.length > maxItems;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Critical Actions
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-400" />
            Critical Actions
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No critical actions at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Critical Actions
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {actions.length}
          </span>
        </h3>
        {hasMore && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedActions.map((action) => {
          const config = actionTypeConfig[action.type];
          const Icon = config.icon;

          return (
            <div
              key={action.id}
              className={clsx(
                'border-l-4 rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition-colors cursor-pointer',
                priorityStyles[action.priority]
              )}
              onClick={() => onActionClick?.(action)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={clsx('p-2 rounded-lg', config.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {action.description}
                    </div>
                    {action.serviceOrderRef && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        #{action.serviceOrderRef}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
