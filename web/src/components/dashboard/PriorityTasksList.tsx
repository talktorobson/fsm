/**
 * Priority Tasks List
 * Shows prioritized tasks with status, due dates, and quick actions
 */

import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface PriorityTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: string;
  serviceOrderRef?: string;
  category: string;
}

interface PriorityTasksListProps {
  tasks: PriorityTask[];
  onTaskClick?: (task: PriorityTask) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onViewAll?: () => void;
  loading?: boolean;
  maxItems?: number;
}

const statusConfig: Record<TaskStatus, { icon: typeof Circle; label: string; color: string }> = {
  pending: { icon: Circle, label: 'Pending', color: 'text-gray-400' },
  in_progress: { icon: Clock, label: 'In Progress', color: 'text-blue-500' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-green-500' },
  overdue: { icon: AlertCircle, label: 'Overdue', color: 'text-red-500' },
};

const priorityStyles: Record<TaskPriority, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

type FilterType = 'all' | 'today' | 'overdue' | 'urgent';

export default function PriorityTasksList({
  tasks,
  onTaskClick,
  onStatusChange,
  onViewAll,
  loading = false,
  maxItems = 8,
}: PriorityTasksListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return task.status === 'overdue';
    if (filter === 'urgent') return task.priority === 'urgent';
    if (filter === 'today') {
      if (!task.dueDate) return false;
      const today = new Date().toDateString();
      return new Date(task.dueDate).toDateString() === today;
    }
    return true;
  });

  const displayedTasks = filteredTasks.slice(0, maxItems);
  const hasMore = filteredTasks.length > maxItems;

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Priority Tasks
          </h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Priority Tasks
          {filteredTasks.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {filteredTasks.length}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['all', 'today', 'overdue', 'urgent'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-md transition-colors',
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No tasks match the current filter</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {displayedTasks.map((task) => {
              const statusInfo = statusConfig[task.status];
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onTaskClick?.(task)}
                >
                  <button
                    className={clsx(
                      'flex-shrink-0 transition-colors',
                      statusInfo.color,
                      task.status !== 'completed' && 'hover:text-green-500'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStatusChange && task.status !== 'completed') {
                        onStatusChange(task.id, 'completed');
                      }
                    }}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'font-medium text-sm truncate',
                          task.status === 'completed'
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900'
                        )}
                      >
                        {task.title}
                      </span>
                      <span
                        className={clsx(
                          'text-xs font-medium px-1.5 py-0.5 rounded',
                          priorityStyles[task.priority]
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{task.category}</span>
                      {task.serviceOrderRef && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">#{task.serviceOrderRef}</span>
                        </>
                      )}
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDueDate(task.dueDate)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>

          {hasMore && onViewAll && (
            <button
              onClick={onViewAll}
              className="w-full mt-3 py-2 text-sm text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-lg transition-colors"
            >
              View All Tasks ({filteredTasks.length})
            </button>
          )}
        </>
      )}
    </div>
  );
}
