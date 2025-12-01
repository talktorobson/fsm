/**
 * Provider Detail Page
 * Enhanced with AHS business rules - working schedules, intervention zones, service priorities
 */

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/services/provider-service';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  Building,
  Users,
  Shield,
  Map,
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ProviderTypeEnum, RiskLevel, ServicePriorityType, ZoneType } from '@/types';

const riskLevelColors: Record<RiskLevel, string> = {
  [RiskLevel.NONE]: 'badge-gray',
  [RiskLevel.LOW]: 'badge-success',
  [RiskLevel.MEDIUM]: 'badge-warning',
  [RiskLevel.HIGH]: 'badge-danger',
  [RiskLevel.CRITICAL]: 'bg-red-900 text-white',
};

const priorityTypeLabels: Record<ServicePriorityType, { label: string; color: string }> = {
  [ServicePriorityType.P1_ALWAYS_ACCEPT]: { label: 'P1 - Always Accept', color: 'badge-success' },
  [ServicePriorityType.P2_BUNDLE_ONLY]: { label: 'P2 - Bundle Only', color: 'badge-warning' },
  [ServicePriorityType.OPT_OUT]: { label: 'Opt-out', color: 'badge-danger' },
};

const zoneTypeColors: Record<ZoneType, string> = {
  [ZoneType.PRIMARY]: 'badge-success',
  [ZoneType.SECONDARY]: 'badge-warning',
  [ZoneType.EXTENDED]: 'badge-gray',
  [ZoneType.EMERGENCY]: 'badge-danger',
};

const dayOfWeekLabels: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => providerService.getById(id!),
    enabled: !!id,
  });

  const { data: workingSchedules } = useQuery({
    queryKey: ['provider-schedules', id],
    queryFn: () => providerService.getWorkingSchedules(id!),
    enabled: !!id,
  });

  const { data: interventionZones } = useQuery({
    queryKey: ['provider-zones', id],
    queryFn: () => providerService.getInterventionZones(id!),
    enabled: !!id,
  });

  const { data: servicePriorities } = useQuery({
    queryKey: ['provider-priorities', id],
    queryFn: () => providerService.getServicePriorities(id!),
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
          <Link to="/operator/providers" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
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
          to="/operator/providers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Providers
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
            <p className="text-gray-500 mt-1">{provider.legalName}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={clsx('badge', {
                'badge-success': provider.status === 'ACTIVE',
                'badge-gray': provider.status === 'INACTIVE',
                'badge-danger': provider.status === 'SUSPENDED',
              })}>
                {provider.status}
              </span>
              {provider.providerType && (
                <span className={clsx('badge', provider.providerType === ProviderTypeEnum.P1 ? 'badge-primary' : 'badge-secondary')}>
                  {provider.providerType === ProviderTypeEnum.P1 ? 'P1 - Primary' : 'P2 - Secondary'}
                </span>
              )}
              {provider.riskLevel && (
                <span className={clsx('badge', riskLevelColors[provider.riskLevel])}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {provider.riskLevel} Risk
                </span>
              )}
              <span className="text-sm text-gray-500">
                {provider.externalId} • {provider.countryCode} • {provider.businessUnit}
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
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-600" />
              Provider Information
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">External ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{provider.externalId || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{provider.taxId || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country / BU</dt>
                <dd className="mt-1 text-sm text-gray-900">{provider.countryCode} / {provider.businessUnit}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider Type</dt>
                <dd className="mt-1">
                  <span className={clsx('badge', provider.providerType === ProviderTypeEnum.P1 ? 'badge-primary' : 'badge-secondary')}>
                    {provider.providerType === ProviderTypeEnum.P1 ? 'P1 - Primary (Always Accept Core)' : 'P2 - Secondary (Bundle Only)'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {provider.email || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {provider.phone || '-'}
                </dd>
              </div>
              {provider.address && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {provider.address.street}, {provider.address.city}, {provider.address.postalCode}, {provider.address.country}
                  </dd>
                </div>
              )}
              {provider.latitude && provider.longitude && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Coordinates</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {provider.latitude.toFixed(6)}, {provider.longitude.toFixed(6)}
                  </dd>
                </div>
              )}
              {provider.contractStartDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contract Start</dt>
                  <dd className="mt-1 text-sm text-gray-900">{format(new Date(provider.contractStartDate), 'PPP')}</dd>
                </div>
              )}
              {provider.contractEndDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contract End</dt>
                  <dd className="mt-1 text-sm text-gray-900">{format(new Date(provider.contractEndDate), 'PPP')}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
                <dd className="mt-1">
                  <span className={clsx('badge', riskLevelColors[provider.riskLevel || RiskLevel.LOW])}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {provider.riskLevel || 'LOW'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(provider.createdAt), 'PPP')}</dd>
              </div>
            </dl>

            {/* Parent/Child Providers */}
            {(provider.parentProvider || (provider.childProviders && provider.childProviders.length > 0)) && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold mb-3">Provider Hierarchy</h3>
                {provider.parentProvider && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Parent Provider:</span>
                    <Link to={`/providers/${provider.parentProvider.id}`} className="ml-2 text-primary-600 hover:underline">
                      {provider.parentProvider.name}
                    </Link>
                  </div>
                )}
                {provider.childProviders && provider.childProviders.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Child Providers:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {provider.childProviders.map(child => (
                        <Link key={child.id} to={`/providers/${child.id}`} className="badge badge-gray hover:bg-gray-200">
                          {child.name} ({child.providerType})
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Working Schedule */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                Working Schedule
              </h2>
              <button className="btn btn-sm btn-secondary">Edit Schedule</button>
            </div>
            {workingSchedules && workingSchedules.length > 0 ? (
              <div className="space-y-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => {
                  const schedule = workingSchedules.find(s => s.dayOfWeek === day);
                  return (
                    <div key={day} className={clsx('flex items-center justify-between p-2 rounded', schedule?.isWorkingDay ? 'bg-green-50' : 'bg-gray-50')}>
                      <span className="font-medium text-sm w-24">{dayOfWeekLabels[day]}</span>
                      {schedule?.isWorkingDay ? (
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-700">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          {schedule.maxCapacity && (
                            <span className="badge badge-primary text-xs">
                              Max: {schedule.maxCapacity} jobs
                            </span>
                          )}
                          {schedule.breaks && schedule.breaks.length > 0 && (
                            <span className="text-xs text-gray-500">
                              Breaks: {schedule.breaks.map(b => `${b.startTime}-${b.endTime}`).join(', ')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No working schedule configured. Work teams will inherit from Business Unit defaults.</p>
            )}
          </div>

          {/* Service Priority Matrix (P1/P2/Opt-out) */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-600" />
                Service Priority Matrix
              </h2>
              <button className="btn btn-sm btn-secondary">Configure Priorities</button>
            </div>
            {servicePriorities && servicePriorities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {servicePriorities.map(sp => (
                      <tr key={sp.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">{sp.service?.name || 'Unknown'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{sp.service?.code || '-'}</td>
                        <td className="px-4 py-2">
                          <span className={clsx('badge text-xs', priorityTypeLabels[sp.priorityType]?.color)}>
                            {priorityTypeLabels[sp.priorityType]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={clsx('badge text-xs', sp.isActive ? 'badge-success' : 'badge-gray')}>
                            {sp.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{sp.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No service priorities configured. Provider will accept all services by default.</p>
            )}
          </div>

          {/* Intervention Zones */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Map className="w-5 h-5 text-primary-600" />
                Intervention Zones
              </h2>
              <button className="btn btn-sm btn-secondary">Manage Zones</button>
            </div>
            {interventionZones && interventionZones.length > 0 ? (
              <div className="space-y-4">
                {interventionZones.map(zone => (
                  <div key={zone.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{zone.name}</h3>
                        <span className={clsx('badge text-xs', zoneTypeColors[zone.zoneType])}>
                          {zone.zoneType}
                        </span>
                        <span className={clsx('badge text-xs', zone.isActive ? 'badge-success' : 'badge-gray')}>
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Priority: {zone.priority}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {zone.postalCodes && zone.postalCodes.length > 0 && (
                        <div>
                          <span className="text-gray-500">Postal Codes:</span>
                          <span className="ml-2">{zone.postalCodes.slice(0, 5).join(', ')}{zone.postalCodes.length > 5 ? ` +${zone.postalCodes.length - 5} more` : ''}</span>
                        </div>
                      )}
                      {zone.maxTravelTimeMinutes && (
                        <div>
                          <span className="text-gray-500">Max Travel:</span>
                          <span className="ml-2">{zone.maxTravelTimeMinutes} min</span>
                        </div>
                      )}
                      {zone.maxDistanceKm && (
                        <div>
                          <span className="text-gray-500">Max Distance:</span>
                          <span className="ml-2">{zone.maxDistanceKm} km</span>
                        </div>
                      )}
                      {zone.workTeamAssignments && zone.workTeamAssignments.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Assigned Teams:</span>
                          <span className="ml-2">
                            {zone.workTeamAssignments.map(a => a.workTeam?.name).filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No intervention zones configured.</p>
            )}
          </div>

          {/* Work Teams */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Work Teams ({provider.workTeams?.length || 0})
              </h2>
              <button className="btn btn-sm btn-secondary">Manage Teams</button>
            </div>
            {provider.workTeams && provider.workTeams.length > 0 ? (
              <div className="space-y-4">
                {provider.workTeams.map(team => (
                  <div key={team.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{team.name}</h3>
                        <span className={clsx('badge text-xs', {
                          'badge-success': team.status === 'ACTIVE',
                          'badge-gray': team.status === 'INACTIVE',
                          'badge-danger': team.status === 'SUSPENDED',
                          'badge-warning': team.status === 'ON_LEAVE',
                        })}>
                          {team.status}
                        </span>
                        {team.externalId && <span className="text-xs text-gray-400">{team.externalId}</span>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {team.technicians?.length || 0} technicians
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                      <div>
                        <span className="text-gray-500">Capacity:</span>
                        <span className="ml-2">{team.maxDailyJobs} jobs/day</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Skills:</span>
                        <span className="ml-2">{team.skills?.slice(0, 3).join(', ')}{team.skills?.length > 3 ? ` +${team.skills.length - 3}` : ''}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Working Days:</span>
                        <span className="ml-2">{team.workingDays?.join(', ')}</span>
                      </div>
                    </div>
                    {team.technicians && team.technicians.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-2">
                          {team.technicians.map(tech => (
                            <span key={tech.id} className={clsx('badge text-xs', tech.isTeamLead ? 'badge-primary' : 'badge-gray')}>
                              {tech.firstName} {tech.lastName}
                              {tech.isTeamLead && ' ★'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No work teams configured.</p>
            )}
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
                <Calendar className="w-4 h-4 mr-2" />
                View Availability Calendar
              </button>
              <button className="btn btn-secondary w-full text-sm">
                <Users className="w-4 h-4 mr-2" />
                Manage Work Teams
              </button>
              <button className="btn btn-secondary w-full text-sm">
                <Map className="w-4 h-4 mr-2" />
                Configure Zones
              </button>
              <button className="btn btn-secondary w-full text-sm">
                <Target className="w-4 h-4 mr-2" />
                Service Priorities
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

          {/* Store Assignments */}
          {provider.storeAssignments && provider.storeAssignments.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Store Assignments
              </h3>
              <div className="space-y-2">
                {provider.storeAssignments.map((assignment, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{assignment.store?.name || 'Unknown Store'}</span>
                    <span className={clsx('badge text-xs', {
                      'badge-primary': assignment.assignmentType === 'PRIMARY',
                      'badge-secondary': assignment.assignmentType === 'SECONDARY',
                      'badge-gray': assignment.assignmentType === 'BACKUP',
                    })}>
                      {assignment.assignmentType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
