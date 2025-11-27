/**
 * Daily Summary Modal
 * Provides an overview of the day's operations
 */

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin
} from 'lucide-react';
import ModalContainer from './ModalContainer';
import clsx from 'clsx';

interface DailySummaryData {
  date: string;
  metrics: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    scheduledVisits: number;
    cancelledOrders: number;
    avgResponseTime: string;
    customerSatisfaction: number;
  };
  comparison: {
    ordersChange: number;
    completionRateChange: number;
    satisfactionChange: number;
  };
  urgentItems: Array<{
    id: string;
    type: 'overdue' | 'at_risk' | 'escalated';
    title: string;
    description: string;
  }>;
  topProviders: Array<{
    id: string;
    name: string;
    completedJobs: number;
    rating: number;
  }>;
  regionBreakdown: Array<{
    region: string;
    orders: number;
    completed: number;
  }>;
}

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailySummaryData;
  onDateChange: (date: string) => void;
  onViewOrder: (orderId: string) => void;
}

export default function DailySummaryModal({
  isOpen,
  onClose,
  data,
  onDateChange,
  onViewOrder,
}: DailySummaryModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'urgent' | 'providers' | 'regions'>('overview');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(data.date);
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const completionRate = Math.round((data.metrics.completedOrders / data.metrics.totalOrders) * 100) || 0;

  const renderTrend = (value: number, suffix = '%') => {
    const isPositive = value >= 0;
    return (
      <span className={clsx(
        'flex items-center gap-1 text-sm font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        {isPositive ? '+' : ''}{value}{suffix}
      </span>
    );
  };

  const getUrgentTypeStyles = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'escalated':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const tabs: Array<{ id: 'overview' | 'urgent' | 'providers' | 'regions'; label: string; icon: typeof BarChart3; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'urgent', label: 'Urgent', icon: AlertTriangle, count: data.urgentItems.length },
    { id: 'providers', label: 'Top Providers', icon: Users },
    { id: 'regions', label: 'Regions', icon: MapPin },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600">Total Orders</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.metrics.totalOrders}</div>
          {renderTrend(data.comparison.ordersChange)}
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.metrics.completedOrders}</div>
          <span className="text-sm text-gray-500">{completionRate}% rate</span>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600">Pending</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.metrics.pendingOrders}</div>
          <span className="text-sm text-gray-500">awaiting action</span>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-600">Scheduled</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.metrics.scheduledVisits}</div>
          <span className="text-sm text-gray-500">visits today</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Performance</h4>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Avg Response Time</p>
            <p className="text-xl font-semibold text-gray-900">{data.metrics.avgResponseTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Customer Satisfaction</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-semibold text-gray-900">{data.metrics.customerSatisfaction.toFixed(1)}/5</p>
              {renderTrend(data.comparison.satisfactionChange)}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-semibold text-gray-900">{completionRate}%</p>
              {renderTrend(data.comparison.completionRateChange)}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Progress</h4>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0 orders</span>
          <span>{data.metrics.completedOrders} / {data.metrics.totalOrders} completed</span>
          <span>{data.metrics.totalOrders} orders</span>
        </div>
      </div>
    </div>
  );

  const renderUrgentTab = () => (
    <div className="space-y-3">
      {data.urgentItems.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No urgent items to address</p>
          <p className="text-sm text-gray-500">Great job keeping things on track!</p>
        </div>
      ) : (
        data.urgentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewOrder(item.id)}
            className={clsx(
              'w-full text-left p-4 rounded-xl border-2 hover:shadow-md transition-shadow',
              getUrgentTypeStyles(item.type)
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-medium">
                    {item.type.replace('_', ' ')}
                  </span>
                </div>
                <h5 className="font-medium mt-1">{item.title}</h5>
                <p className="text-sm opacity-80 mt-1">{item.description}</p>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );

  const renderProvidersTab = () => (
    <div className="space-y-3">
      {data.topProviders.map((provider, index) => (
        <div
          key={provider.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
        >
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white',
            index === 0 ? 'bg-yellow-500' :
            index === 1 ? 'bg-gray-400' :
            index === 2 ? 'bg-amber-700' : 'bg-gray-300'
          )}>
            {index + 1}
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900">{provider.name}</h5>
            <p className="text-sm text-gray-500">
              {provider.completedJobs} jobs completed today
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="font-semibold">{provider.rating.toFixed(1)}</span>
              <span className="text-yellow-400">★</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRegionsTab = () => (
    <div className="space-y-3">
      {data.regionBreakdown.map((region) => {
        const regionCompletion = Math.round((region.completed / region.orders) * 100) || 0;
        return (
          <div key={region.region} className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">{region.region}</h5>
              <span className="text-sm text-gray-600">
                {region.completed}/{region.orders} orders
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${regionCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{regionCompletion}% completion rate</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Operations Summary"
      size="xl"
    >
      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">{formatDate(data.date)}</span>
        </div>
        <button
          onClick={() => navigateDate('next')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={clsx(
                'px-1.5 py-0.5 rounded-full text-xs',
                activeTab === tab.id ? 'bg-blue-200' : 'bg-gray-200'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'urgent' && renderUrgentTab()}
        {activeTab === 'providers' && renderProvidersTab()}
        {activeTab === 'regions' && renderRegionsTab()}
      </div>
    </ModalContainer>
  );
}
