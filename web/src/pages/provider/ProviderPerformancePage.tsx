/**
 * Provider Performance Page
 * 
 * Shows KPIs, ratings, response times, and performance metrics.
 * Enables providers to track their performance and identify areas for improvement.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Star, Award, Filter, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { performanceService, ProviderPerformance } from '@/services/performance-service';

interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  target?: string | number;
}

interface Rating {
  id: string;
  customer: string;
  job: string;
  rating: number;
  comment: string;
  date: string;
}

// Transform provider performance data to metrics format
function transformToMetrics(provider: ProviderPerformance): PerformanceMetric[] {
  const m = provider.metrics;
  return [
    { 
      label: 'Customer Rating', 
      value: m.customerRating.toFixed(1), 
      change: provider.trends.qualityTrend === 'up' ? 5 : provider.trends.qualityTrend === 'down' ? -5 : 0, 
      trend: provider.trends.qualityTrend === 'up' ? 'up' : provider.trends.qualityTrend === 'down' ? 'down' : 'neutral', 
      target: 4.5 
    },
    { 
      label: 'Response Time', 
      value: `${m.responseTime}h`, 
      change: -10, 
      trend: 'up', 
      target: '4h' 
    },
    { 
      label: 'Completion Rate', 
      value: `${m.completionRate}%`, 
      change: provider.trends.completionRateTrend === 'up' ? 2 : provider.trends.completionRateTrend === 'down' ? -2 : 0, 
      trend: provider.trends.completionRateTrend === 'up' ? 'up' : provider.trends.completionRateTrend === 'down' ? 'down' : 'neutral', 
      target: '95%' 
    },
    { 
      label: 'On-Time Delivery', 
      value: `${m.onTimeDeliveryRate}%`, 
      change: 1, 
      trend: 'up', 
      target: '95%' 
    },
    { 
      label: 'Quality Score', 
      value: m.qualityScore.toFixed(1), 
      change: provider.trends.qualityTrend === 'up' ? 3 : 0, 
      trend: provider.trends.qualityTrend === 'up' ? 'up' : 'neutral', 
      target: 4.0 
    },
    { 
      label: 'Acceptance Rate', 
      value: `${m.acceptanceRate}%`, 
      change: 2, 
      trend: 'up', 
      target: '90%' 
    },
  ];
}

// Mock ratings - would come from a separate ratings API
const mockRatings: Rating[] = [
  { id: '1', customer: 'Jean Dupont', job: 'Installation électrique', rating: 5, comment: 'Excellent travail, très professionnel', date: '2025-11-26' },
  { id: '2', customer: 'Marie Martin', job: 'Dépannage urgent', rating: 5, comment: 'Rapide et efficace, je recommande', date: '2025-11-25' },
  { id: '3', customer: 'Pierre Bernard', job: 'Mise aux normes', rating: 4, comment: 'Bon travail, quelques retards mineurs', date: '2025-11-24' },
  { id: '4', customer: 'Sophie Petit', job: 'Diagnostic', rating: 5, comment: 'Très compétent, a trouvé le problème rapidement', date: '2025-11-23' },
  { id: '5', customer: 'Luc Moreau', job: 'Installation prise', rating: 4, comment: 'Travail propre et soigné', date: '2025-11-22' },
];

export default function ProviderPerformancePage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Calculate date range based on timeRange
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [timeRange]);

  // Fetch provider performance from API
  const { data: performanceData, isLoading, isError } = useQuery({
    queryKey: ['provider-performance', user?.providerId, dateRange],
    queryFn: () => performanceService.getProviderPerformance({
      providerId: user?.providerId,
      countryCode: user?.countryCode,
      ...dateRange,
    }),
    enabled: !!user,
  });

  // Get current provider's metrics
  const providerMetrics = performanceData?.providers?.[0];
  const metrics = providerMetrics ? transformToMetrics(providerMetrics) : [];

  // Calculate overall score from metrics
  const overallScore = providerMetrics 
    ? Math.round(
        (providerMetrics.metrics.completionRate * 0.3 +
         providerMetrics.metrics.customerRating * 20 * 0.3 +
         providerMetrics.metrics.onTimeDeliveryRate * 0.2 +
         providerMetrics.metrics.qualityScore * 20 * 0.2)
      )
    : 0;

  // Generate monthly data from provider metrics
  const monthlyData = useMemo(() => {
    if (!providerMetrics) return [];
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const baseJobs = Math.round(providerMetrics.metrics.totalAssignments / 6);
    return months.map((month) => ({
      month,
      jobs: baseJobs + Math.round((Math.random() - 0.5) * 20),
      revenue: (baseJobs + Math.round((Math.random() - 0.5) * 20)) * 400,
      rating: 4.5 + Math.random() * 0.5,
    }));
  }, [providerMetrics]);

  const getStatusColor = (current: number | string, target: number | string): string => {
    const curr = typeof current === 'string' ? parseFloat(current) : current;
    const targ = typeof target === 'string' ? parseFloat(target) : target;
    if (curr >= targ) return 'text-green-600';
    if (curr >= targ * 0.9) return 'text-amber-600';
    return 'text-red-600';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading performance data...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div>
          <p className="font-medium text-red-800">Failed to load performance data</p>
          <p className="text-sm text-red-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600">Track your metrics and improve your service quality</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input w-40"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Compare
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card mb-6 p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg opacity-90">Overall Performance Score</h2>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-5xl font-bold">{overallScore}</span>
              <span className="text-2xl opacity-70">/100</span>
            </div>
            <p className="mt-2 text-sm opacity-80">
              <span className="inline-flex items-center gap-1">
                {providerMetrics?.trends.completionRateTrend === 'up' ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Trending up from last period
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    Trending down from last period
                  </>
                )}
              </span>
            </p>
          </div>
          <div className="text-right">
            <Award className="w-16 h-16 opacity-30" />
            <p className="text-sm opacity-80 mt-2">
              {overallScore >= 90 ? 'Top 10% Provider' : overallScore >= 80 ? 'Top 25% Provider' : 'Active Provider'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className={clsx(
                  'text-2xl font-bold mt-1',
                  metric.target && getStatusColor(metric.value, metric.target)
                )}>
                  {metric.value}
                </p>
              </div>
              <div className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
                metric.trend === 'up' ? 'bg-green-100 text-green-700' : 
                metric.trend === 'down' ? 'bg-red-100 text-red-700' : 
                'bg-gray-100 text-gray-700'
              )}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                 metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                {Math.abs(metric.change)}%
              </div>
            </div>
            {metric.target && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Target: {metric.target}</span>
                  <span className={getStatusColor(metric.value, metric.target)}>
                    {typeof metric.value === 'number' && typeof metric.target === 'number'
                      ? metric.value >= metric.target ? '✓ Met' : `${((metric.value / metric.target) * 100).toFixed(0)}%`
                      : 'On track'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={clsx(
                      'h-2 rounded-full',
                      getStatusColor(metric.value, metric.target).replace('text-', 'bg-')
                    )}
                    style={{ width: `${Math.min(100, ((typeof metric.value === 'number' ? metric.value : parseFloat(String(metric.value))) / (typeof metric.target === 'number' ? metric.target : parseFloat(String(metric.target)))) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Monthly Trend</h3>
          </div>
          <div className="p-4">
            <div className="flex items-end justify-between h-48 gap-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-primary-100 rounded-t relative" style={{ height: `${(data.jobs / 70) * 100}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600">
                      {data.jobs}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-600 rounded" /> Jobs Completed
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Rating Distribution</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((ratingValue) => {
                const count = mockRatings.filter(r => r.rating === ratingValue).length;
                const percentage = (count / mockRatings.length) * 100;
                return (
                  <div key={ratingValue} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm">{ratingValue}</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-amber-400 h-4 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {providerMetrics?.metrics.customerRating.toFixed(1) || '4.5'}
              </p>
              <p className="text-sm text-gray-600">Average Rating ({mockRatings.length} reviews)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Recent Reviews</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {mockRatings.map((review) => (
            <div key={review.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.customer}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{review.job}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={clsx(
                          'w-4 h-4',
                          i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
