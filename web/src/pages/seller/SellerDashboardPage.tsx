/**
 * Seller Dashboard Page
 * Sales performance and availability overview
 */

import { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Star,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

interface SalesMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  target?: number;
}

interface Appointment {
  id: string;
  customerName: string;
  address: string;
  time: string;
  service: string;
  estimatedValue: number;
  status: 'confirmed' | 'pending' | 'completed';
}

const metrics: SalesMetric[] = [
  { label: 'Sales This Month', value: '€45,200', change: 12.5, trend: 'up', target: 50000 },
  { label: 'Conversion Rate', value: '28%', change: 3.2, trend: 'up' },
  { label: 'Avg Deal Size', value: '€1,850', change: -2.1, trend: 'down' },
  { label: 'Appointments', value: 24, change: 8, trend: 'up' },
];

const todayAppointments: Appointment[] = [
  {
    id: '1',
    customerName: 'Marie Laurent',
    address: '12 Rue des Fleurs, 69003 Lyon',
    time: '09:00 - 10:30',
    service: 'Isolation complète',
    estimatedValue: 8500,
    status: 'completed',
  },
  {
    id: '2',
    customerName: 'Pierre Moreau',
    address: '45 Avenue Jean Jaurès, 69007 Lyon',
    time: '11:00 - 12:30',
    service: 'Pompe à chaleur',
    estimatedValue: 12000,
    status: 'completed',
  },
  {
    id: '3',
    customerName: 'Sophie Dubois',
    address: '78 Rue de la République, 69001 Lyon',
    time: '14:00 - 15:30',
    service: 'Panneaux solaires',
    estimatedValue: 15000,
    status: 'confirmed',
  },
  {
    id: '4',
    customerName: 'Jean-Marc Bernard',
    address: '23 Place Bellecour, 69002 Lyon',
    time: '16:00 - 17:30',
    service: 'Chaudière gaz',
    estimatedValue: 4500,
    status: 'pending',
  },
];

const weeklyPerformance = [
  { day: 'Mon', sales: 8500, appointments: 4 },
  { day: 'Tue', sales: 12000, appointments: 5 },
  { day: 'Wed', sales: 6800, appointments: 3 },
  { day: 'Thu', sales: 9200, appointments: 4 },
  { day: 'Fri', sales: 8700, appointments: 4 },
  { day: 'Sat', sales: 0, appointments: 0 },
  { day: 'Sun', sales: 0, appointments: 0 },
];

export default function SellerDashboardPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const completedToday = todayAppointments.filter(a => a.status === 'completed').length;
  const remainingToday = todayAppointments.filter(a => a.status !== 'completed').length;
  const todayRevenue = todayAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.estimatedValue, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good afternoon, Jean!</h1>
            <p className="text-green-100 mt-1">
              You have {remainingToday} appointments remaining today
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">€{todayRevenue.toLocaleString()}</div>
            <div className="text-green-100 text-sm">Sold today ({completedToday} deals)</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{metric.label}</span>
              <span className={clsx(
                'flex items-center gap-1 text-xs font-medium',
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {Math.abs(metric.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            {metric.target && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(parseFloat(String(metric.value).replace(/[€,]/g, '')) / metric.target) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: €{metric.target.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Today's Appointments
            </h2>
            <span className="text-sm text-gray-500">
              {completedToday} of {todayAppointments.length} completed
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {todayAppointments.map(appointment => (
              <div
                key={appointment.id}
                className={clsx(
                  'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                  appointment.status === 'completed' && 'opacity-60'
                )}
                onClick={() => setSelectedAppointment(
                  selectedAppointment === appointment.id ? null : appointment.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      appointment.status === 'completed' && 'bg-green-100',
                      appointment.status === 'confirmed' && 'bg-blue-100',
                      appointment.status === 'pending' && 'bg-yellow-100',
                    )}>
                      {appointment.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {appointment.status === 'confirmed' && <Clock className="w-5 h-5 text-blue-600" />}
                      {appointment.status === 'pending' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{appointment.customerName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointment.time}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {appointment.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      €{appointment.estimatedValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{appointment.service}</div>
                    <ChevronRight className={clsx(
                      'w-4 h-4 text-gray-400 mt-1 ml-auto transition-transform',
                      selectedAppointment === appointment.id && 'rotate-90'
                    )} />
                  </div>
                </div>
                
                {selectedAppointment === appointment.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                      <Phone className="w-4 h-4" />
                      Call Customer
                    </button>
                    <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                    {appointment.status !== 'completed' && (
                      <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Log Visit
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-4">
          {/* Weekly Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
            <div className="flex items-end justify-between h-32 gap-1">
              {weeklyPerformance.map((day, idx) => {
                const maxSales = Math.max(...weeklyPerformance.map(d => d.sales));
                const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
                const isToday = idx === 3; // Thursday
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-full rounded-t transition-all',
                        isToday ? 'bg-green-500' : 'bg-gray-200',
                        height === 0 && 'bg-gray-100'
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`€${day.sales.toLocaleString()}`}
                    />
                    <span className={clsx(
                      'text-xs',
                      isToday ? 'text-green-600 font-medium' : 'text-gray-500'
                    )}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <div>
                <div className="text-gray-500">Week Total</div>
                <div className="font-semibold text-gray-900">
                  €{weeklyPerformance.reduce((s, d) => s + d.sales, 0).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Appointments</div>
                <div className="font-semibold text-gray-900">
                  {weeklyPerformance.reduce((s, d) => s + d.appointments, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Team Leaderboard
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Marie C.', sales: 62500, rank: 1 },
                { name: 'You', sales: 45200, rank: 2, isYou: true },
                { name: 'Pierre D.', sales: 43800, rank: 3 },
                { name: 'Sophie L.', sales: 38200, rank: 4 },
              ].map(seller => (
                <div
                  key={seller.name}
                  className={clsx(
                    'flex items-center justify-between p-2 rounded-lg',
                    seller.isYou && 'bg-green-50 border border-green-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      seller.rank === 1 && 'bg-yellow-400 text-yellow-900',
                      seller.rank === 2 && 'bg-gray-300 text-gray-700',
                      seller.rank === 3 && 'bg-amber-600 text-white',
                      seller.rank > 3 && 'bg-gray-100 text-gray-500',
                    )}>
                      {seller.rank}
                    </div>
                    <span className={clsx(
                      'font-medium',
                      seller.isYou ? 'text-green-700' : 'text-gray-900'
                    )}>
                      {seller.name}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    €{(seller.sales / 1000).toFixed(1)}k
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Check Availability
              </button>
              <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                TV Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
