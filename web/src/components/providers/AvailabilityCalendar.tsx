/**
 * Availability Calendar Component
 * Visual calendar showing provider/team availability with slot management
 */

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: {
    id: string;
    name: string;
    serviceOrderRef?: string;
  };
}

interface DayAvailability {
  date: string;
  isWorkingDay: boolean;
  slots: TimeSlot[];
  capacity: number;
  bookedCount: number;
  absenceReason?: string;
}

interface CalendarConfig {
  workingDays: string[];
  defaultStartTime: string;
  defaultEndTime: string;
  slotDuration: number; // in minutes
}

interface AvailabilityCalendarProps {
  providerId?: string;
  teamId?: string;
  availability: DayAvailability[];
  config: CalendarConfig;
  onDateSelect?: (date: string) => void;
  onSlotSelect?: (date: string, slot: TimeSlot) => void;
  onAddAbsence?: (date: string) => void;
  onRemoveAbsence?: (date: string) => void;
  readOnly?: boolean;
  selectedDate?: string;
}

export default function AvailabilityCalendar({
  availability,
  config: _config,
  onDateSelect,
  onSlotSelect,
  onAddAbsence,
  onRemoveAbsence,
  readOnly = false,
  selectedDate,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Get availability for a specific date
  const getAvailabilityForDate = (date: Date): DayAvailability | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.find(a => a.date === dateStr);
  };

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Render capacity indicator
  const renderCapacityBadge = (dayAvail: DayAvailability) => {
    if (!dayAvail.isWorkingDay) return null;
    
    const utilization = dayAvail.capacity > 0 
      ? (dayAvail.bookedCount / dayAvail.capacity) * 100 
      : 0;
    
    const getColor = () => {
      if (utilization >= 90) return 'bg-red-500';
      if (utilization >= 70) return 'bg-yellow-500';
      if (utilization > 0) return 'bg-green-500';
      return 'bg-gray-300';
    };

    return (
      <div className="flex items-center gap-1 mt-0.5">
        <div className={clsx('w-1.5 h-1.5 rounded-full', getColor())} />
        <span className="text-[10px] text-gray-500">
          {dayAvail.bookedCount}/{dayAvail.capacity}
        </span>
      </div>
    );
  };

  // Render day cell
  const renderDay = (day: Date) => {
    const dayAvail = getAvailabilityForDate(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const isSelected = selectedDate === dateStr;
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isTodayDate = isToday(day);

    return (
      <button
        key={dateStr}
        onClick={() => onDateSelect?.(dateStr)}
        disabled={!isCurrentMonth}
        className={clsx(
          'relative aspect-square p-1 text-sm rounded-lg transition-all',
          !isCurrentMonth && 'text-gray-300 cursor-default',
          isCurrentMonth && 'hover:bg-gray-100',
          isSelected && 'ring-2 ring-blue-500 bg-blue-50',
          isTodayDate && 'font-bold',
          dayAvail?.absenceReason && 'bg-red-50',
          dayAvail && !dayAvail.isWorkingDay && isCurrentMonth && !dayAvail.absenceReason && 'bg-gray-50'
        )}
      >
        <div className="flex flex-col items-center">
          <span className={clsx(
            'w-6 h-6 rounded-full flex items-center justify-center',
            isTodayDate && 'bg-blue-600 text-white'
          )}>
            {format(day, 'd')}
          </span>
          
          {isCurrentMonth && dayAvail && (
            <>
              {dayAvail.absenceReason ? (
                <div className="text-[10px] text-red-600 truncate w-full text-center mt-0.5">
                  {dayAvail.absenceReason}
                </div>
              ) : dayAvail.isWorkingDay ? (
                renderCapacityBadge(dayAvail)
              ) : (
                <div className="text-[10px] text-gray-400 mt-0.5">Off</div>
              )}
            </>
          )}
        </div>
      </button>
    );
  };

  // Render selected day's slots
  const renderDaySlots = () => {
    if (!selectedDate) return null;
    
    const dayAvail = availability.find(a => a.date === selectedDate);
    if (!dayAvail) return null;

    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
          </h4>
          {!readOnly && dayAvail.isWorkingDay && !dayAvail.absenceReason && onAddAbsence && (
            <button
              onClick={() => onAddAbsence(selectedDate)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Mark as Absence
            </button>
          )}
          {!readOnly && dayAvail.absenceReason && onRemoveAbsence && (
            <button
              onClick={() => onRemoveAbsence(selectedDate)}
              className="text-xs text-green-600 hover:text-green-700"
            >
              Clear Absence
            </button>
          )}
        </div>

        {dayAvail.absenceReason ? (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Absence</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{dayAvail.absenceReason}</p>
          </div>
        ) : !dayAvail.isWorkingDay ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Non-working day</p>
          </div>
        ) : dayAvail.slots.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dayAvail.slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSlotSelect?.(selectedDate, slot)}
                disabled={readOnly || slot.isBooked}
                className={clsx(
                  'w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors',
                  slot.isBooked && 'bg-blue-50 border-blue-200',
                  !slot.isBooked && slot.isAvailable && 'border-gray-200 hover:border-green-300 hover:bg-green-50',
                  !slot.isAvailable && !slot.isBooked && 'bg-gray-50 border-gray-200 opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  {slot.isBooked && slot.bookedBy && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {slot.bookedBy.serviceOrderRef || slot.bookedBy.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {slot.isBooked ? (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Booked
                    </span>
                  ) : slot.isAvailable ? (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Available
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Blocked
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No slots configured</p>
          </div>
        )}

        {/* Summary */}
        {dayAvail.isWorkingDay && !dayAvail.absenceReason && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
            <span>Available: {dayAvail.slots.filter(s => s.isAvailable && !s.isBooked).length}</span>
            <span>Booked: {dayAvail.bookedCount}</span>
            <span>Capacity: {dayAvail.capacity}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['month', 'week', 'day'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                viewMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h4>
          <button
            onClick={goToToday}
            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-0.5 border border-blue-200 rounded"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span className="text-gray-500">70%+ Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-gray-500">Full</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <span className="text-gray-500">Off/Empty</span>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(renderDay)}
      </div>

      {/* Selected Day Slots */}
      {renderDaySlots()}
    </div>
  );
}

export type { DayAvailability, TimeSlot, CalendarConfig };
