/**
 * Provider Dashboard Page
 * Main cockpit view for active providers
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronRight,
  Star,
  FileText,
  Bell,
} from 'lucide-react';
import clsx from 'clsx';

// Mock data for provider dashboard
const mockDashboardData = {
  provider: {
    name: 'Électricité Pro Paris',
    rating: 4.8,
    totalJobs: 156,
    activeTeams: 3,
    status: 'ACTIVE',
  },
  stats: {
    pendingOffers: 5,
    activeJobs: 8,
    completedThisMonth: 23,
    revenue: 12450,
    pendingWCF: 2,
    avgResponseTime: '2.3h',
  },
  recentJobs: [
    { id: 'SO-2024-001', customer: 'Jean Dupont', service: 'Installation électrique', status: 'IN_PROGRESS', scheduledDate: '2025-11-28', amount: 450 },
    { id: 'SO-2024-002', customer: 'Marie Martin', service: 'Dépannage urgent', status: 'ASSIGNED', scheduledDate: '2025-11-27', amount: 150 },
    { id: 'SO-2024-003', customer: 'Pierre Bernard', service: 'Mise aux normes', status: 'COMPLETED', scheduledDate: '2025-11-26', amount: 890 },
    { id: 'SO-2024-004', customer: 'Sophie Petit', service: 'Diagnostic', status: 'PENDING_WCF', scheduledDate: '2025-11-25', amount: 80 },
  ],
  pendingActions: [
    { type: 'offer', title: 'New job offer in Paris 15e', time: '10 min ago', urgent: true },
    { type: 'wcf', title: 'WCF pending for SO-2024-004', time: '2 hours ago', urgent: false },
    { type: 'schedule', title: 'Confirm schedule for tomorrow', time: '3 hours ago', urgent: false },
  ],
  upcomingSchedule: [
    { time: '09:00', customer: 'Jean Dupont', address: '15 Rue de la Paix, Paris 15e', type: 'Installation' },
    { time: '14:00', customer: 'Marie Martin', address: '8 Avenue des Champs, Paris 8e', type: 'Dépannage' },
    { time: '16:30', customer: 'Paul Durand', address: '22 Rue Victor Hugo, Paris 16e', type: 'Diagnostic' },
  ],
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color = 'green',
  trend,
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string | number;
  subValue?: string;
  color?: 'green' | 'blue' | 'orange' | 'purple';
  trend?: { value: number; positive: boolean };
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ASSIGNED: { label: 'Assigned', className: 'bg-blue-100 text-blue-700' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700' },
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
    PENDING_WCF: { label: 'Pending WCF', className: 'bg-orange-100 text-orange-700' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };

  return (
    <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', config.className)}>
      {config.label}
    </span>
  );
}

export default function ProviderDashboardPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const data = mockDashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {data.provider.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{data.provider.rating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{data.provider.totalJobs} jobs completed</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{data.provider.activeTeams} active teams</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange('today')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              timeRange === 'today' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              timeRange === 'week' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              timeRange === 'month' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {data.pendingActions.some(a => a.urgent) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-orange-900">You have urgent actions</h3>
              <p className="text-sm text-orange-700 mt-0.5">
                {data.pendingActions.filter(a => a.urgent).length} items require your immediate attention
              </p>
            </div>
            <Link 
              to="/provider/jobs" 
              className="text-sm font-medium text-orange-700 hover:text-orange-800 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Briefcase} 
          label="Pending Offers" 
          value={data.stats.pendingOffers} 
          subValue="Respond within 24h"
          color="orange"
        />
        <StatCard 
          icon={Clock} 
          label="Active Jobs" 
          value={data.stats.activeJobs} 
          color="blue"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Completed" 
          value={data.stats.completedThisMonth} 
          subValue="This month"
          color="green"
          trend={{ value: 12, positive: true }}
        />
        <StatCard 
          icon={DollarSign} 
          label="Revenue" 
          value={`€${data.stats.revenue.toLocaleString()}`} 
          subValue="This month"
          color="purple"
          trend={{ value: 8, positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/provider/jobs" className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentJobs.map(job => (
              <Link
                key={job.id}
                to={`/provider/jobs/${job.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{job.id}</span>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{job.customer} • {job.service}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.scheduledDate}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-medium text-gray-900">€{job.amount}</p>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Today's Schedule</h2>
            <Link to="/provider/calendar" className="text-sm text-green-600 hover:text-green-700">
              <Calendar className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.upcomingSchedule.map((slot, index) => (
              <div key={index} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 text-center">
                    <span className="text-sm font-semibold text-green-600">{slot.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{slot.customer}</p>
                    <p className="text-sm text-gray-500 truncate">{slot.address}</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                      {slot.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <Link 
              to="/provider/calendar" 
              className="text-sm text-green-600 hover:text-green-700 flex items-center justify-center gap-1"
            >
              View full calendar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link 
          to="/provider/jobs?filter=pending"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white hover:from-orange-600 hover:to-orange-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Offers</p>
              <p className="text-3xl font-bold mt-1">{data.stats.pendingOffers}</p>
              <p className="text-orange-100 text-sm mt-2">Review and accept →</p>
            </div>
            <Briefcase className="w-12 h-12 text-orange-200" />
          </div>
        </Link>

        <Link 
          to="/provider/financial"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white hover:from-purple-600 hover:to-purple-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending WCF</p>
              <p className="text-3xl font-bold mt-1">{data.stats.pendingWCF}</p>
              <p className="text-purple-100 text-sm mt-2">Submit completion forms →</p>
            </div>
            <FileText className="w-12 h-12 text-purple-200" />
          </div>
        </Link>

        <Link 
          to="/provider/performance"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white hover:from-blue-600 hover:to-blue-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Response Time</p>
              <p className="text-3xl font-bold mt-1">{data.stats.avgResponseTime}</p>
              <p className="text-blue-100 text-sm mt-2">View performance →</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </Link>
      </div>
    </div>
  );
}
