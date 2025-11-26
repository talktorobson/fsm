/**
 * Operations Grid Component
 * Weekly view showing providers/work teams and their scheduled service slots
 * Based on aux-ux/index.html Operations Grid design
 */

import { useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import clsx from 'clsx';

// Types
export interface ScheduledSlot {
  id: string;
  serviceOrderRef: string;
  serviceType: string;
  customerName: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  estimatedDuration: number; // in hours
  address?: string;
  priority?: 'normal' | 'urgent';
}

export interface GridRow {
  id: string;
  type: 'provider' | 'work_team';
  name: string;
  providerName?: string; // for work teams
  avatar?: string;
  capacity: number;
  skills: string[];
  slots: {
    [date: string]: ScheduledSlot[];
  };
}

interface OperationsGridProps {
  rows: GridRow[];
  onSlotClick?: (slot: ScheduledSlot, row: GridRow) => void;
  onCreateSlot?: (date: string, row: GridRow) => void;
  onRowClick?: (row: GridRow) => void;
  loading?: boolean;
  weekOffset?: number;
  onWeekChange?: (offset: number) => void;
}

// Helper functions
const getWeekDates = (offset: number = 0): Date[] => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDayHeader = (date: Date): { day: string; date: string; isToday: boolean } => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.getDate().toString(),
    isToday,
  };
};

// Slot status styling
const slotStatusStyles: Record<ScheduledSlot['status'], { bg: string; border: string; text: string }> = {
  scheduled: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  in_progress: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  completed: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500' },
  cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-400 line-through' },
  delayed: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
};

// Time slot labels
const timeSlotLabels: Record<ScheduledSlot['timeSlot'], string> = {
  morning: '8-12h',
  afternoon: '12-17h',
  evening: '17-20h',
};

export default function OperationsGrid({
  rows,
  onSlotClick,
  onCreateSlot,
  onRowClick,
  loading = false,
  weekOffset = 0,
  onWeekChange,
}: OperationsGridProps) {
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  
  const weekRange = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }, [weekDates]);

  const handlePrevWeek = () => {
    onWeekChange?.(weekOffset - 1);
  };

  const handleNextWeek = () => {
    onWeekChange?.(weekOffset + 1);
  };

  const handleToday = () => {
    onWeekChange?.(0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg mb-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with week navigation */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Operations Grid
          </h2>
          <span className="text-sm text-gray-500">{weekRange}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              weekOffset === 0
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Today
          </button>
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          {/* Day headers */}
          <thead>
            <tr className="bg-gray-50">
              <th className="w-48 px-4 py-3 text-left border-b border-r border-gray-200">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider / Team
                </span>
              </th>
              {weekDates.map((date) => {
                const { day, date: dayNum, isToday } = formatDayHeader(date);
                return (
                  <th
                    key={formatDate(date)}
                    className={clsx(
                      'px-2 py-3 text-center border-b border-r border-gray-200 last:border-r-0',
                      isToday && 'bg-green-50'
                    )}
                  >
                    <div className="text-xs font-medium text-gray-500 uppercase">
                      {day}
                    </div>
                    <div
                      className={clsx(
                        'text-lg font-semibold mt-0.5',
                        isToday ? 'text-green-600' : 'text-gray-900'
                      )}
                    >
                      {dayNum}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No providers or teams to display</p>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {/* Row header - Provider/Team info */}
                  <td 
                    className="px-4 py-3 border-b border-r border-gray-200 cursor-pointer"
                    onClick={() => onRowClick?.(row)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium',
                        row.type === 'provider' ? 'bg-green-500' : 'bg-blue-500'
                      )}>
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {row.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          {row.type === 'work_team' && row.providerName && (
                            <span>{row.providerName}</span>
                          )}
                          {row.type === 'work_team' && row.providerName && (
                            <span>•</span>
                          )}
                          <span>{row.capacity} slots/day</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekDates.map((date) => {
                    const dateKey = formatDate(date);
                    const { isToday } = formatDayHeader(date);
                    const daySlots = row.slots[dateKey] || [];

                    return (
                      <td
                        key={dateKey}
                        className={clsx(
                          'px-2 py-2 border-b border-r border-gray-200 last:border-r-0 align-top',
                          isToday && 'bg-green-50/50'
                        )}
                      >
                        <div className="space-y-1 min-h-[60px]">
                          {daySlots.map((slot) => {
                            const styles = slotStatusStyles[slot.status];
                            return (
                              <div
                                key={slot.id}
                                className={clsx(
                                  'p-2 rounded-lg border cursor-pointer transition-shadow hover:shadow-md',
                                  styles.bg,
                                  styles.border
                                )}
                                onClick={() => onSlotClick?.(slot, row)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className={clsx('text-xs font-medium truncate', styles.text)}>
                                      #{slot.serviceOrderRef}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                      {slot.customerName}
                                    </div>
                                  </div>
                                  {slot.priority === 'urgent' && (
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                  )}
                                  {slot.status === 'completed' && (
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {timeSlotLabels[slot.timeSlot]}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {slot.estimatedDuration}h
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Empty slot - Click to create */}
                          {daySlots.length < row.capacity && (
                            <button
                              onClick={() => onCreateSlot?.(dateKey, row)}
                              className="w-full p-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-green-300 hover:text-green-500 hover:bg-green-50 transition-colors"
                            >
                              + Add slot
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
