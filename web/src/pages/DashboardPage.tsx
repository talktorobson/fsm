/**
 * Dashboard Page
 * Overview of key metrics and recent activity
 */

import { Link } from 'react-router-dom';
import { ClipboardList, UserCheck, Users, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Yellow Grid Field Service Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/service-orders" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Service Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <Link to="/assignments" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Link>

        <Link to="/providers" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Providers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Link>

        <Link to="/tasks" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Service Orders</h2>
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Alerts & Tasks</h2>
          <p className="text-gray-500 text-sm">No pending tasks</p>
        </div>
      </div>
    </div>
  );
}
