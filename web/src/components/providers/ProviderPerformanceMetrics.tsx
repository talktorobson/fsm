/**
 * Provider Performance Metrics Component
 * Displays KPIs, ratings, and performance trends
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  CheckCircle2,
  BarChart3,
  Target,
  Zap,
  Calendar,
} from 'lucide-react';

interface PerformanceData {
  period: string;
  metrics: {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    averageRating: number;
    responseTimeMinutes: number;
    completionRate: number;
    onTimeRate: number;
    customerSatisfaction: number;
    firstTimeFixRate: number;
    revenueGenerated?: number;
  };
  trends: {
    completionRateTrend: number;
    ratingTrend: number;
    responseTimeTrend: number;
    onTimeTrend: number;
  };
  benchmarks?: {
    avgCompletionRate: number;
    avgRating: number;
    avgResponseTime: number;
    avgOnTimeRate: number;
  };
}

interface MonthlyData {
  month: string;
  jobs: number;
  completed: number;
  rating: number;
}

interface ProviderPerformanceMetricsProps {
  data: PerformanceData;
  monthlyHistory?: MonthlyData[];
  showBenchmarks?: boolean;
}

export default function ProviderPerformanceMetrics({
  data,
  monthlyHistory = [],
  showBenchmarks = true,
}: ProviderPerformanceMetricsProps) {
  // Calculate performance scores
  const performanceScore = useMemo(() => {
    const weights = {
      completion: 0.25,
      rating: 0.25,
      onTime: 0.25,
      ftfr: 0.25,
    };

    const scores = {
      completion: (data.metrics.completionRate / 100) * 100,
      rating: (data.metrics.averageRating / 5) * 100,
      onTime: (data.metrics.onTimeRate / 100) * 100,
      ftfr: (data.metrics.firstTimeFixRate / 100) * 100,
    };

    return Math.round(
      scores.completion * weights.completion +
      scores.rating * weights.rating +
      scores.onTime * weights.onTime +
      scores.ftfr * weights.ftfr
    );
  }, [data.metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderTrend = (value: number, inverted = false) => {
    const isPositive = inverted ? value < 0 : value > 0;
    return (
      <span className={clsx(
        'flex items-center gap-0.5 text-xs font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={clsx(
            'w-4 h-4',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );

  const renderComparisonBar = (value: number, label: string, benchmark?: number) => {
    const maxValue = Math.max(value, benchmark || 0, 100);
    const valueWidth = (value / maxValue) * 100;
    const benchmarkWidth = benchmark ? (benchmark / maxValue) * 100 : 0;

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-gray-900">{value.toFixed(1)}%</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              'absolute h-full rounded-full',
              value >= (benchmark || 0) ? 'bg-green-500' : 'bg-yellow-500'
            )}
            style={{ width: `${valueWidth}%` }}
          />
          {benchmark && (
            <div
              className="absolute w-0.5 h-4 -top-1 bg-gray-600"
              style={{ left: `${benchmarkWidth}%` }}
              title={`Benchmark: ${benchmark}%`}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={clsx(
        'rounded-xl p-6 text-center',
        getScoreBg(performanceScore)
      )}>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Performance Score</h3>
        <div className="flex items-center justify-center gap-2">
          <span className={clsx('text-5xl font-bold', getScoreColor(performanceScore))}>
            {performanceScore}
          </span>
          <span className="text-2xl text-gray-400">/100</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Based on completion, rating, timeliness, and first-time fix rate
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            {renderTrend(data.trends.completionRateTrend)}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.metrics.completionRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Completion Rate</p>
          {showBenchmarks && data.benchmarks?.avgCompletionRate && (
            <p className={clsx(
              'text-[10px] mt-1',
              data.metrics.completionRate >= data.benchmarks.avgCompletionRate ? 'text-green-600' : 'text-red-600'
            )}>
              {data.metrics.completionRate >= data.benchmarks.avgCompletionRate ? '↑' : '↓'} vs {data.benchmarks.avgCompletionRate}% avg
            </p>
          )}
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-600" />
            </div>
            {renderTrend(data.trends.ratingTrend)}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {data.metrics.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">/5</span>
          </div>
          <p className="text-xs text-gray-500">Average Rating</p>
          <div className="mt-1">
            {renderStars(Math.round(data.metrics.averageRating))}
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            {renderTrend(data.trends.responseTimeTrend, true)}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.metrics.responseTimeMinutes < 60 
              ? `${data.metrics.responseTimeMinutes}m`
              : `${(data.metrics.responseTimeMinutes / 60).toFixed(1)}h`}
          </p>
          <p className="text-xs text-gray-500">Avg Response Time</p>
          {showBenchmarks && data.benchmarks?.avgResponseTime && (
            <p className={clsx(
              'text-[10px] mt-1',
              data.metrics.responseTimeMinutes <= data.benchmarks.avgResponseTime ? 'text-green-600' : 'text-red-600'
            )}>
              {data.metrics.responseTimeMinutes <= data.benchmarks.avgResponseTime ? '↓' : '↑'} vs {data.benchmarks.avgResponseTime}m avg
            </p>
          )}
        </div>

        {/* On-Time Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            {renderTrend(data.trends.onTimeTrend)}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.metrics.onTimeRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">On-Time Rate</p>
        </div>
      </div>

      {/* Job Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Job Statistics ({data.period})
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data.metrics.totalJobs}</p>
            <p className="text-xs text-blue-700">Total Jobs</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data.metrics.completedJobs}</p>
            <p className="text-xs text-green-700">Completed</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{data.metrics.cancelledJobs}</p>
            <p className="text-xs text-red-700">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Performance Bars with Benchmarks */}
      {showBenchmarks && data.benchmarks && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Performance vs Benchmarks
          </h4>
          <div className="space-y-4">
            {renderComparisonBar(
              data.metrics.completionRate,
              'Completion Rate',
              data.benchmarks.avgCompletionRate
            )}
            {renderComparisonBar(
              data.metrics.onTimeRate,
              'On-Time Rate',
              data.benchmarks.avgOnTimeRate
            )}
            {renderComparisonBar(
              data.metrics.firstTimeFixRate,
              'First Time Fix Rate'
            )}
            {renderComparisonBar(
              data.metrics.customerSatisfaction,
              'Customer Satisfaction'
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Above benchmark</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Below benchmark</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-gray-600" />
              <span>Benchmark line</span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trend */}
      {monthlyHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Monthly Trend
          </h4>
          <div className="flex items-end gap-2 h-32">
            {monthlyHistory.map((month) => {
              const height = (month.completed / Math.max(...monthlyHistory.map(m => m.jobs))) * 100;
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <div
                      className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                      title={`${month.completed}/${month.jobs} jobs`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{month.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">First Time Fix Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.metrics.firstTimeFixRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Issues resolved on first visit
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.metrics.customerSatisfaction.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on post-service surveys
          </p>
        </div>
      </div>

      {data.metrics.revenueGenerated !== undefined && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
          <h4 className="text-sm font-medium text-green-700 mb-1">Revenue Generated</h4>
          <p className="text-3xl font-bold text-green-800">
            €{data.metrics.revenueGenerated.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Total revenue from completed jobs ({data.period})
          </p>
        </div>
      )}
    </div>
  );
}

export type { PerformanceData, MonthlyData };
