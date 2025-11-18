/**
 * Tasks Page
 * Operator task list with SLA tracking
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

// Mock task type for now (to be replaced with real API)
interface Task {
  id: string;
  type: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  title: string;
  description: string;
  dueDate?: string;
  slaDeadline?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 20,
  });

  // TODO: Replace with real API call
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      // Mock data for now
      return [] as Task[];
    },
  });

  const getPriorityBadge = (priority: Task['priority']) => {
    const colors = {
      URGENT: 'badge-danger',
      HIGH: 'badge-warning',
      MEDIUM: 'badge-info',
      LOW: 'badge-gray',
    };
    return <span className={clsx('badge', colors[priority])}>{priority}</span>;
  };

  const getStatusBadge = (status: Task['status']) => {
    const colors = {
      PENDING: 'badge-warning',
      IN_PROGRESS: 'badge-info',
      COMPLETED: 'badge-success',
    };
    return <span className={clsx('badge', colors[status])}>{status}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks & Alerts</h1>
        <p className="text-gray-600 mt-1">
          {tasks.length} tasks • SLA tracking and operator assignments
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            className="input w-48"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            className="input w-40"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button className="btn btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent Tasks</p>
              <p className="text-2xl font-bold text-red-600 mt-1">0</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SLA at Risk</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">0</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600 mt-1">0</p>
            </div>
            <AlertCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              Tasks will appear here when there are pending actions or SLA-critical items.
            </p>
            <div className="mt-6 text-sm text-gray-600">
              <p className="font-medium mb-2">Task types include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Assignment required for service orders</li>
                <li>Risk review and acknowledgment</li>
                <li>Customer contact required</li>
                <li>Missing documents</li>
                <li>SLA breach warnings</li>
                <li>High-risk service orders</li>
              </ul>
            </div>
          </div>
        ) : (
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left">Task</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Priority</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">SLA Deadline</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="table-row">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.description}</div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">{task.type}</span>
                  </td>
                  <td className="table-cell">{getPriorityBadge(task.priority)}</td>
                  <td className="table-cell">{getStatusBadge(task.status)}</td>
                  <td className="table-cell text-sm text-gray-500">
                    {task.slaDeadline ? format(new Date(task.slaDeadline), 'PPp') : '-'}
                  </td>
                  <td className="table-cell text-sm text-gray-500">
                    {format(new Date(task.createdAt), 'MMM dd, HH:mm')}
                  </td>
                  <td className="table-cell">
                    <button className="text-primary-600 hover:text-primary-900 text-sm">
                      View Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
