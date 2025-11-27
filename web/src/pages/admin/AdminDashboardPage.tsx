/**
 * Admin Dashboard Page
 * System-wide metrics and management overview
 */

import { useState } from 'react';
import {
  Users,
  Building2,
  FileText,
  Euro,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Settings,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

interface SystemMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const systemMetrics: SystemMetric[] = [
  { label: 'Active Users', value: '1,248', change: 5.2, trend: 'up', icon: Users, color: 'blue' },
  { label: 'Active Providers', value: 342, change: 3.8, trend: 'up', icon: Building2, color: 'green' },
  { label: 'Service Orders', value: '8,456', change: 12.1, trend: 'up', icon: FileText, color: 'purple' },
  { label: 'Monthly Revenue', value: '€2.4M', change: 8.5, trend: 'up', icon: Euro, color: 'emerald' },
];

const recentAlerts: SystemAlert[] = [
  { id: '1', type: 'error', message: 'API rate limit exceeded for provider API endpoint', timestamp: '2 min ago', resolved: false },
  { id: '2', type: 'warning', message: '15 providers have pending document verification', timestamp: '15 min ago', resolved: false },
  { id: '3', type: 'info', message: 'Database backup completed successfully', timestamp: '1 hour ago', resolved: true },
  { id: '4', type: 'warning', message: 'High server load detected (85% CPU)', timestamp: '2 hours ago', resolved: true },
];

const quickStats = {
  pendingVerifications: 23,
  openTickets: 18,
  systemHealth: 98.5,
  activeJobs: 156,
};

export default function AdminDashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">System overview and management</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  metric.color === 'blue' && 'bg-blue-100',
                  metric.color === 'green' && 'bg-green-100',
                  metric.color === 'purple' && 'bg-purple-100',
                  metric.color === 'emerald' && 'bg-emerald-100',
                )}>
                  <Icon className={clsx(
                    'w-5 h-5',
                    metric.color === 'blue' && 'text-blue-600',
                    metric.color === 'green' && 'text-green-600',
                    metric.color === 'purple' && 'text-purple-600',
                    metric.color === 'emerald' && 'text-emerald-600',
                  )} />
                </div>
                <span className={clsx(
                  'flex items-center gap-1 text-xs font-medium',
                  metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                )}>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {metric.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {metric.change}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-500">{metric.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            System Health
          </h2>
          
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-green-500"
                  strokeWidth="8"
                  strokeDasharray={`${(quickStats.systemHealth / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-900">{quickStats.systemHealth}%</span>
                <span className="text-sm text-gray-500">Healthy</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'API Response Time', value: '45ms', status: 'good' },
              { label: 'Database', value: 'Connected', status: 'good' },
              { label: 'Redis Cache', value: 'Connected', status: 'good' },
              { label: 'Background Jobs', value: '3 pending', status: 'warning' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    item.status === 'good' && 'bg-green-500',
                    item.status === 'warning' && 'bg-yellow-500',
                    item.status === 'error' && 'bg-red-500',
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Quick Stats
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Pending Verifications</span>
              </div>
              <span className="font-bold text-yellow-600">{quickStats.pendingVerifications}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Open Support Tickets</span>
              </div>
              <span className="font-bold text-blue-600">{quickStats.openTickets}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Active Jobs</span>
              </div>
              <span className="font-bold text-green-600">{quickStats.activeJobs}</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              View All Users
            </button>
            <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              System Settings
            </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-400" />
            Recent Alerts
          </h2>

          <div className="space-y-3">
            {recentAlerts.map(alert => (
              <div
                key={alert.id}
                className={clsx(
                  'p-3 rounded-lg border',
                  alert.type === 'error' && 'bg-red-50 border-red-100',
                  alert.type === 'warning' && 'bg-yellow-50 border-yellow-100',
                  alert.type === 'info' && 'bg-blue-50 border-blue-100',
                  alert.resolved && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-2">
                  {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />}
                  {alert.type === 'info' && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className={clsx(
                      'text-sm',
                      alert.type === 'error' && 'text-red-800',
                      alert.type === 'warning' && 'text-yellow-800',
                      alert.type === 'info' && 'text-blue-800',
                    )}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.timestamp}
                      {alert.resolved && ' • Resolved'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            View All Alerts →
          </button>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity (Last 7 Days)</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2" />
            <p>Activity chart visualization</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'User Management', icon: Users, color: 'blue', path: '/admin/users' },
          { label: 'Role Permissions', icon: Shield, color: 'purple', path: '/admin/roles' },
          { label: 'System Config', icon: Settings, color: 'gray', path: '/admin/config' },
          { label: 'Audit Logs', icon: FileText, color: 'green', path: '/admin/audit' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
            >
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                item.color === 'blue' && 'bg-blue-100',
                item.color === 'purple' && 'bg-purple-100',
                item.color === 'gray' && 'bg-gray-100',
                item.color === 'green' && 'bg-green-100',
              )}>
                <Icon className={clsx(
                  'w-5 h-5',
                  item.color === 'blue' && 'text-blue-600',
                  item.color === 'purple' && 'text-purple-600',
                  item.color === 'gray' && 'text-gray-600',
                  item.color === 'green' && 'text-green-600',
                )} />
              </div>
              <div className="font-medium text-gray-900">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
