/**
 * Customer Schedule Page
 * View and reschedule appointments
 */

import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import clsx from 'clsx';

interface TimeSlot {
  id: string;
  date: string;
  dayName: string;
  dayNumber: number;
  month: string;
  startTime: string;
  endTime: string;
  available: boolean;
  isSelected: boolean;
}

interface Appointment {
  date: string;
  startTime: string;
  endTime: string;
  technician: {
    name: string;
    company: string;
    phone: string;
    rating: number;
  };
  address: string;
  serviceType: string;
}

const currentAppointment: Appointment = {
  date: 'Thursday, November 28, 2025',
  startTime: '09:00',
  endTime: '12:00',
  technician: {
    name: 'Marc Lefebvre',
    company: 'Électricité Plus SARL',
    phone: '+33 6 12 34 56 78',
    rating: 4.8,
  },
  address: '45 Rue de la République, 69001 Lyon',
  serviceType: 'Electrical Panel Upgrade',
};

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Dec', 'Dec', 'Dec', 'Dec', 'Dec', 'Dec'];
  const dayNumbers = [2, 3, 4, 5, 6, 7];
  
  days.forEach((day, idx) => {
    ['09:00-12:00', '14:00-17:00'].forEach((time, timeIdx) => {
      const [start, end] = time.split('-');
      slots.push({
        id: `${idx}-${timeIdx}`,
        date: `2025-12-${String(dayNumbers[idx]).padStart(2, '0')}`,
        dayName: day,
        dayNumber: dayNumbers[idx],
        month: months[idx],
        startTime: start,
        endTime: end,
        available: Math.random() > 0.3,
        isSelected: false,
      });
    });
  });
  
  return slots;
};

export default function CustomerSchedulePage() {
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);

  const timeSlots = generateTimeSlots();

  const handleRescheduleSubmit = () => {
    if (selectedSlot && rescheduleReason) {
      setRescheduleSubmitted(true);
      setTimeout(() => {
        setShowReschedule(false);
        setRescheduleSubmitted(false);
        setSelectedSlot(null);
        setRescheduleReason('');
      }, 2000);
    }
  };

  const uniqueDays = Array.from(new Set(timeSlots.map(s => s.date))).map(date => {
    const slot = timeSlots.find(s => s.date === date)!;
    return {
      date,
      dayName: slot.dayName,
      dayNumber: slot.dayNumber,
      month: slot.month,
    };
  });

  return (
    <div className="space-y-6">
      {/* Current Appointment Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <span className="font-semibold">Your Scheduled Appointment</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 rounded-xl p-4 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-green-700">28</div>
              <div className="text-sm text-green-600">Nov</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{currentAppointment.date}</h3>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentAppointment.startTime} - {currentAppointment.endTime}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{currentAppointment.address}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{currentAppointment.technician.name}</h4>
                <p className="text-sm text-gray-500">{currentAppointment.technician.company}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'w-3 h-3 rounded-full',
                        i < Math.round(currentAppointment.technician.rating)
                          ? 'bg-yellow-400'
                          : 'bg-gray-200'
                      )}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{currentAppointment.technician.rating}</span>
                </div>
              </div>
              <a
                href={`tel:${currentAppointment.technician.phone}`}
                className="p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600">Service Type</div>
            <div className="font-medium text-gray-900">{currentAppointment.serviceType}</div>
          </div>
        </div>
      </div>

      {/* Reschedule Section */}
      {!showReschedule ? (
        <button
          onClick={() => setShowReschedule(true)}
          className="w-full py-4 px-6 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Need to reschedule?
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-amber-50 p-4 border-b border-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Reschedule Request</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Please select a new time slot and provide a reason. The provider will confirm your request.
                </p>
              </div>
            </div>
          </div>

          {rescheduleSubmitted ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Request Submitted!</h3>
              <p className="text-gray-600 mt-2">The provider will confirm your new appointment shortly.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Week Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset === 0}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-gray-900">
                  {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : `In ${weekOffset} weeks`}
                </span>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-6 gap-2">
                {uniqueDays.map(day => (
                  <div key={day.date} className="text-center">
                    <div className="text-xs text-gray-500">{day.dayName}</div>
                    <div className="text-lg font-bold text-gray-900">{day.dayNumber}</div>
                    <div className="text-xs text-gray-400">{day.month}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-2">
                {['Morning (09:00-12:00)', 'Afternoon (14:00-17:00)'].map((label, timeIdx) => (
                  <div key={label} className="grid grid-cols-6 gap-2">
                    {uniqueDays.map(day => {
                      const slot = timeSlots.find(
                        s => s.date === day.date && s.startTime === (timeIdx === 0 ? '09:00' : '14:00')
                      );
                      if (!slot) return <div key={day.date} />;
                      
                      return (
                        <button
                          key={slot.id}
                          onClick={() => slot.available && setSelectedSlot(slot.id)}
                          disabled={!slot.available}
                          className={clsx(
                            'py-2 px-1 rounded-lg text-xs font-medium transition-all',
                            !slot.available && 'bg-gray-100 text-gray-400 cursor-not-allowed',
                            slot.available && selectedSlot !== slot.id && 'bg-green-50 text-green-700 hover:bg-green-100',
                            selectedSlot === slot.id && 'bg-green-600 text-white ring-2 ring-green-300'
                          )}
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-50 border border-green-200 rounded" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded" />
                  <span>Unavailable</span>
                </div>
              </div>

              {/* Reason Input */}
              {selectedSlot && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for rescheduling
                  </label>
                  <textarea
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Please let us know why you need to reschedule..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReschedule(false);
                    setSelectedSlot(null);
                    setRescheduleReason('');
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={!selectedSlot || !rescheduleReason}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">What to Expect</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-700">1</span>
            </div>
            <span>The technician will arrive within the scheduled time window</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-700">2</span>
            </div>
            <span>You'll receive an SMS 30 minutes before arrival</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-700">3</span>
            </div>
            <span>Ensure someone 18+ is present to sign the work completion form</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
