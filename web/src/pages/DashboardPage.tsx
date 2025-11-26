/**
 * Dashboard Page - Operator Cockpit
 * Control Tower view with metrics, critical actions, and priority tasks
 */

import { Link, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  UserCheck, 
  Users, 
  Clock, 
  RefreshCw, 
  X,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard-service';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import { MetricCard, CriticalActionsPanel, PriorityTasksList } from '@/components/dashboard';
import type { CriticalAction } from '@/components/dashboard';
import type { PriorityTask } from '@/components/dashboard';

// Mock data for critical actions (in production, this would come from API)
const mockCriticalActions: CriticalAction[] = [
  {
    id: '1',
    type: 'contract_not_signed',
    title: 'Contract Awaiting Signature',
    description: 'Customer Marie Dupont has not signed the contract',
    serviceOrderRef: 'SO-2024-001',
    customerName: 'Marie Dupont',
    createdAt: new Date().toISOString(),
    priority: 'critical',
  },
  {
    id: '2',
    type: 'pro_no_show',
    title: 'Professional No-Show Alert',
    description: 'Pierre Durand did not arrive at scheduled appointment',
    serviceOrderRef: 'SO-2024-002',
    providerName: 'Pierre Durand',
    createdAt: new Date().toISOString(),
    priority: 'critical',
  },
  {
    id: '3',
    type: 'wcf_pending',
    title: 'WCF Pending Signature',
    description: 'Work completion form needs customer approval',
    serviceOrderRef: 'SO-2024-003',
    customerName: 'Jean Martin',
    createdAt: new Date().toISOString(),
    priority: 'high',
  },
];

// Mock data for priority tasks
const mockPriorityTasks: PriorityTask[] = [
  {
    id: '1',
    title: 'Review contract for SO-2024-004',
    description: 'Contract requires manager approval',
    status: 'pending',
    priority: 'urgent',
    dueDate: new Date().toISOString(),
    category: 'Contracts',
    serviceOrderRef: 'SO-2024-004',
  },
  {
    id: '2',
    title: 'Assign professional to Plumbing repair',
    status: 'pending',
    priority: 'high',
    dueDate: new Date().toISOString(),
    category: 'Assignments',
    serviceOrderRef: 'SO-2024-005',
  },
  {
    id: '3',
    title: 'Follow up with customer Sophie Bernard',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    category: 'Customer Care',
    serviceOrderRef: 'SO-2024-006',
  },
  {
    id: '4',
    title: 'Complete WCF for electrical work',
    status: 'pending',
    priority: 'high',
    dueDate: new Date().toISOString(),
    category: 'Documentation',
    serviceOrderRef: 'SO-2024-007',
  },
  {
    id: '5',
    title: 'Schedule HVAC maintenance visit',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    category: 'Scheduling',
    serviceOrderRef: 'SO-2024-008',
  },
  {
    id: '6',
    title: 'Process payment for completed job',
    status: 'overdue',
    priority: 'urgent',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    category: 'Billing',
    serviceOrderRef: 'SO-2024-009',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleCriticalActionClick = (action: CriticalAction) => {
    if (action.serviceOrderRef) {
      // In a real app, navigate to the service order detail
      navigate('/service-orders');
    }
  };

  const handleTaskClick = (task: PriorityTask) => {
    if (task.serviceOrderRef) {
      navigate('/service-orders');
    }
  };

  // Calculate today's metrics
  const todayScheduled = stats?.serviceOrders.byStatus?.SCHEDULED ?? 0;
  const inProgress = stats?.serviceOrders.byStatus?.IN_PROGRESS ?? 0;
  const completedToday = stats?.serviceOrders.byStatus?.COMPLETED ?? 0;
  const pendingAssignments = stats?.assignments.pending ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control Tower</h1>
          <p className="text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/calendar"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700">
                We encountered an issue loading the dashboard data. Please try refreshing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid - Green gradient cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Today's Schedule"
              value={todayScheduled}
              icon={Calendar}
              variant="green-1"
              onClick={() => navigate('/calendar')}
            />
            <MetricCard
              title="In Progress"
              value={inProgress}
              icon={Clock}
              variant="green-2"
              onClick={() => navigate('/service-orders?status=IN_PROGRESS')}
            />
            <MetricCard
              title="Completed Today"
              value={completedToday}
              icon={TrendingUp}
              variant="green-3"
              onClick={() => navigate('/service-orders?status=COMPLETED')}
            />
            <MetricCard
              title="Pending Assignments"
              value={pendingAssignments}
              icon={UserCheck}
              variant="green-4"
              onClick={() => navigate('/assignments?status=PENDING')}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Actions Panel - Takes 1 column */}
        <div className="lg:col-span-1">
          <CriticalActionsPanel
            actions={mockCriticalActions}
            onActionClick={handleCriticalActionClick}
            onViewAll={() => navigate('/service-orders')}
            loading={isLoading}
          />
        </div>

        {/* Priority Tasks - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PriorityTasksList
            tasks={mockPriorityTasks}
            onTaskClick={handleTaskClick}
            onViewAll={() => navigate('/tasks')}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/service-orders" 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Service Orders</h3>
            <ClipboardList className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.serviceOrders.total ?? 0}
          </div>
          <p className="text-sm text-gray-500">
            {stats?.serviceOrders.pending ?? 0} pending · {stats?.serviceOrders.byStatus?.ASSIGNED ?? 0} assigned
          </p>
        </Link>

        <Link 
          to="/providers" 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Providers</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.providers.total ?? 0}
          </div>
          <p className="text-sm text-gray-500">
            {stats?.providers.active ?? 0} active today
          </p>
        </Link>

        <Link 
          to="/tasks" 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Tasks Overview</h3>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.tasks.pending ?? 0}
          </div>
          <p className="text-sm text-gray-500">
            {stats?.tasks.overdue ?? 0} overdue tasks
          </p>
        </Link>
      </div>
    </div>
  );
}
