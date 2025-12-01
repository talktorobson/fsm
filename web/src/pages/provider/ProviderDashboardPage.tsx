/**
 * Provider Dashboard Page
 * Main cockpit view for active providers
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Star,
  FileText,
  Bell,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { providerService } from '@/services/provider-service';
import { serviceOrderService } from '@/services/service-order-service';
import { Provider, ServiceOrder, WorkTeam } from '@/types';

interface DashboardData {
  provider: Provider | null;
  workTeams: WorkTeam[];
  recentOrders: ServiceOrder[];
  stats: {
    activeJobs: number;
    completedThisMonth: number;
    pendingOffers: number;
    pendingWCF: number;
  };
}

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
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    provider: null,
    workTeams: [],
    recentOrders: [],
    stats: {
      activeJobs: 0,
      completedThisMonth: 0,
      pendingOffers: 0,
      pendingWCF: 0,
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.providerId) {
        setError('Provider context not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch provider details
        const provider = await providerService.getById(user.providerId);

        // Fetch work teams
        const workTeams = await providerService.getWorkTeams(user.providerId);

        // Fetch recent service orders assigned to this provider
        const ordersResponse = await serviceOrderService.getAll({
          assignedProviderId: user.providerId,
          limit: 10,
        });
        const recentOrders = ordersResponse.data || [];

        // Calculate stats from orders
        const activeStatuses = new Set(['ASSIGNED', 'IN_PROGRESS', 'PENDING_DATE']);
        const completedStatuses = new Set(['COMPLETED', 'CLOSED']);
        const wcfStatuses = new Set(['PENDING_WCF']);

        const stats = {
          activeJobs: recentOrders.filter((o: ServiceOrder) => activeStatuses.has(o.status)).length,
          completedThisMonth: recentOrders.filter((o: ServiceOrder) => completedStatuses.has(o.status)).length,
          pendingOffers: recentOrders.filter((o: ServiceOrder) => o.status === 'CREATED').length,
          pendingWCF: recentOrders.filter((o: ServiceOrder) => wcfStatuses.has(o.status)).length,
        };

        setData({
          provider,
          workTeams,
          recentOrders,
          stats,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.providerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !data.provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{error || 'No provider data'}</h3>
        {!user?.providerId && (
          <p className="text-gray-500 mt-2">You must be logged in as a provider to view this dashboard.</p>
        )}
      </div>
    );
  }

  const activeTeamsCount = data.workTeams.filter(t => t.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {data.provider.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">-</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{data.recentOrders.length} recent orders</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{activeTeamsCount} active teams</span>
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
      {data.stats.pendingOffers > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-orange-900">You have pending offers</h3>
              <p className="text-sm text-orange-700 mt-0.5">
                {data.stats.pendingOffers} items require your attention
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
        />
        <StatCard 
          icon={Users} 
          label="Work Teams" 
          value={activeTeamsCount} 
          subValue={`${data.workTeams.length} total`}
          color="purple"
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
          {data.recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recentOrders.slice(0, 5).map(order => (
                <Link
                  key={order.id}
                  to={`/provider/jobs/${order.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{order.externalId}</span>
                      <JobStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {order.customerInfo?.name || order.customerName || 'Unknown Customer'} • {order.serviceType}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent jobs</p>
            </div>
          )}
        </div>

        {/* Quick Stats / Teams */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Teams</h2>
            <Link to="/provider/teams" className="text-sm text-green-600 hover:text-green-700">
              <Users className="w-4 h-4" />
            </Link>
          </div>
          {data.workTeams.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.workTeams.slice(0, 4).map((team) => (
                <Link 
                  key={team.id}
                  to={`/provider/teams/${team.id}`}
                  className="px-5 py-4 hover:bg-gray-50 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{team.name}</p>
                      <p className="text-sm text-gray-500">
                        {team.postalCodes?.slice(0, 2).join(', ')}{team.postalCodes?.length > 2 ? '...' : ''}
                      </p>
                    </div>
                    <span className={clsx(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      team.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {team.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No teams configured</p>
            </div>
          )}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <Link 
              to="/provider/teams" 
              className="text-sm text-green-600 hover:text-green-700 flex items-center justify-center gap-1"
            >
              Manage teams <ChevronRight className="w-4 h-4" />
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
          to="/provider/jobs?status=PENDING_WCF"
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
              <p className="text-blue-100 text-sm">Performance</p>
              <p className="text-3xl font-bold mt-1">{data.stats.completedThisMonth}</p>
              <p className="text-blue-100 text-sm mt-2">View metrics →</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </Link>
      </div>
    </div>
  );
}
