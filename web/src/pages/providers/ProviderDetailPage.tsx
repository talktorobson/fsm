/**
 * Provider Detail Page
 * View and edit provider details
 */

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/services/provider-service';
import { ArrowLeft, Edit, MapPin, Briefcase, Mail, Phone } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => providerService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading provider...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Provider Not Found</h3>
          <Link to="/providers" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/providers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Providers
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={clsx('badge', {
                'badge-success': provider.status === 'ACTIVE',
                'badge-gray': provider.status === 'INACTIVE',
                'badge-danger': provider.status === 'SUSPENDED',
              })}>
                {provider.status}
              </span>
              <span className="text-sm text-gray-500">
                {provider.externalId} • {provider.countryCode}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Provider
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Details */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Provider Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">External ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{provider.externalId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900">{provider.countryCode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {provider.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {provider.phone}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={clsx('badge', {
                    'badge-success': provider.status === 'ACTIVE',
                    'badge-gray': provider.status === 'INACTIVE',
                    'badge-danger': provider.status === 'SUSPENDED',
                  })}>
                    {provider.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(provider.createdAt), 'PPP')}
                </dd>
              </div>
            </dl>
          </div>

          {/* Service Types */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Service Types</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {provider.serviceTypes.map((type) => (
                <span key={type} className="badge badge-primary">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Coverage Zones */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Coverage Zones</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {provider.coverageZones.map((zone, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{zone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Work Teams */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Work Teams</h2>
            <div className="text-sm text-gray-500">
              Work team management coming soon
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">-</div>
                <div className="text-xs text-gray-500 mt-1">Assignments</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">-</div>
                <div className="text-xs text-gray-500 mt-1">Acceptance Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">-</div>
                <div className="text-xs text-gray-500 mt-1">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn btn-primary w-full text-sm">
                View Availability Calendar
              </button>
              <button className="btn btn-secondary w-full text-sm">
                Manage Work Teams
              </button>
              <button className="btn btn-secondary w-full text-sm">
                View Assignment History
              </button>
              {provider.status === 'ACTIVE' && (
                <button className="btn btn-danger w-full text-sm">
                  Suspend Provider
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
