/**
 * Provider Calendar Page
 * 
 * Shows scheduled jobs, availability management, and team calendars.
 * Allows providers to manage their schedule and block time off.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Clock, Filter, Download, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { calendarService } from '@/services/calendar-service';
import { ServiceOrder } from '@/types';

interface ScheduledJob {
  id: string;
  title: string;
  customer: string;
  address: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  team?: string;
  amount: number;
}

// Transform ServiceOrder to ScheduledJob format for calendar display
function transformToScheduledJob(order: ServiceOrder): ScheduledJob {
  // Extract customer name from customerInfo or customerName
  const customerName = order.customerInfo?.name || order.customerName || 'Unknown Customer';
  
  // Extract address from serviceAddress or customerAddress
  const address = order.serviceAddress 
    ? `${order.serviceAddress.street}, ${order.serviceAddress.city}`
    : order.customerAddress || 'No address';
  
  // Extract time from scheduledDate
  const scheduledTime = order.scheduledDate 
    ? new Date(order.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '09:00';
  
  // Format duration
  const durationHours = order.estimatedDuration 
    ? `${Math.round(order.estimatedDuration / 60)}h`
    : '2h';
  
  // Map status to calendar job status
  let status: 'scheduled' | 'in_progress' | 'completed' = 'scheduled';
  if (order.status === 'IN_PROGRESS') {
    status = 'in_progress';
  } else if (order.status === 'COMPLETED' || order.status === 'VALIDATED' || order.status === 'CLOSED') {
    status = 'completed';
  }
  
  // Extract service name from embedded data or serviceType - API may include related data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderWithRelations = order as any;
  const title = orderWithRelations.service?.name || String(order.serviceType).replace(/_/g, ' ');
  
  // Extract work team name if available from API response
  const teamName = orderWithRelations.assignedWorkTeam?.name;
  
  return {
    id: order.id,
    title,
    customer: customerName,
    address,
    time: scheduledTime,
    duration: durationHours,
    status,
    team: teamName,
    amount: order.totalAmountProvider || order.totalAmountCustomer || 0,
  };
}

// Helper functions extracted to avoid deep nesting
const getJobStatusClass = (status: ScheduledJob['status']): string => {
  if (status === 'in_progress') return 'bg-blue-100 border-l-4 border-blue-500';
  if (status === 'completed') return 'bg-green-100 border-l-4 border-green-500';
  return 'bg-amber-100 border-l-4 border-amber-500';
};

const getTeamStatusColor = (index: number): string => {
  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-gray-400'];
  return colors[index] || 'bg-gray-400';
};

const getTeamStatus = (index: number): string => {
  const statuses = ['2 jobs today', '1 job today', 'Available'];
  return statuses[index] || 'Available';
};

export default function ProviderCalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Calculate date range for API query
  const startDate = formatDateKey(weekDates[0]);
  const endDate = formatDateKey(weekDates[6]);

  // Fetch scheduled orders from API
  const { data: scheduledOrders = [], isLoading, isError } = useQuery({
    queryKey: ['scheduled-orders', user?.providerId, startDate, endDate],
    queryFn: () => calendarService.getScheduledOrders({
      startDate,
      endDate,
      providerId: user?.providerId || undefined,
      countryCode: user?.countryCode,
    }),
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Transform and group jobs by date
  const jobsByDate = useMemo(() => {
    const grouped: Record<string, ScheduledJob[]> = {};
    
    for (const order of scheduledOrders) {
      if (!order.scheduledDate) continue;
      
      const dateKey = order.scheduledDate.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transformToScheduledJob(order));
    }
    
    return grouped;
  }, [scheduledOrders]);

  const getJobsForDate = (date: Date) => {
    return jobsByDate[formatDateKey(date)] || [];
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const totalWeekRevenue = weekDates.reduce((sum, date) => {
    return sum + getJobsForDate(date).reduce((s, job) => s + job.amount, 0);
  }, 0);

  const totalWeekJobs = weekDates.reduce((sum, date) => {
    return sum + getJobsForDate(date).length;
  }, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div>
          <p className="font-medium text-red-800">Failed to load calendar</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Block Time
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-2xl font-bold">{totalWeekJobs} jobs</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-2xl font-bold text-green-600">€{totalWeekRevenue.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Utilization</p>
          <p className="text-2xl font-bold">78%</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Available Slots</p>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="card mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {weekDates[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('day')}
              className={clsx(
                'px-3 py-1 text-sm rounded-lg',
                view === 'day' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={clsx(
                'px-3 py-1 text-sm rounded-lg',
                view === 'week' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              Week
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-sm text-gray-500">Time</div>
              {weekDates.map((date, idx) => {
                const isToday = formatDateKey(date) === formatDateKey(new Date());
                const jobCount = getJobsForDate(date).length;
                const dateKey = formatDateKey(date);
                return (
                  <div
                    key={dateKey}
                    className={clsx(
                      'p-3 text-center border-l border-gray-200',
                      isToday && 'bg-primary-50'
                    )}
                  >
                    <p className="text-sm text-gray-500">{days[idx]}</p>
                    <p className={clsx(
                      'text-lg font-semibold',
                      isToday ? 'text-primary-600' : 'text-gray-900'
                    )}>
                      {date.getDate()}
                    </p>
                    {jobCount > 0 && (
                      <p className="text-xs text-gray-500">{jobCount} job{jobCount > 1 ? 's' : ''}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-2 text-sm text-gray-500 text-right pr-4">
                  {hour}:00
                </div>
                {weekDates.map((date) => {
                  const jobs = getJobsForDate(date).filter(job => {
                    const jobHour = Number.parseInt(job.time.split(':')[0], 10);
                    return jobHour === hour;
                  });
                  const slotKey = `${formatDateKey(date)}-${hour}`;
                  return (
                    <div
                      key={slotKey}
                      className="border-l border-gray-200 p-1 min-h-[80px] hover:bg-gray-50"
                    >
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className={clsx(
                            'p-2 rounded text-xs mb-1 cursor-pointer transition-all hover:shadow-md',
                            getJobStatusClass(job.status)
                          )}
                        >
                          <p className="font-medium truncate">{job.title}</p>
                          <p className="text-gray-600 truncate">{job.customer}</p>
                          <div className="flex items-center gap-2 mt-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{job.time} ({job.duration})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Availability */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Team Availability</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {['Équipe A - Jean, Pierre', 'Équipe B - Marie, Sophie', 'Équipe C - Luc, Emma'].map((team, idx) => (
              <div key={team} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-3 h-3 rounded-full',
                    getTeamStatusColor(idx)
                  )} />
                  <span className="font-medium">{team}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {getTeamStatus(idx)}
                  </span>
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
