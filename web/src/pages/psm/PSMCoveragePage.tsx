/**
 * PSM Coverage Page
 * Geographic coverage analysis and gap identification
 * Uses real API data from intervention zones
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  AlertTriangle,
  CheckCircle,
  Building2,
  TrendingUp,
  Search,
  Download,
  Plus,
  Eye,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { providerService } from '@/services/provider-service';

// French department code to name mapping (sample)
const DEPARTMENT_NAMES: Record<string, { name: string; region: string }> = {
  '01': { name: 'Ain', region: 'Auvergne-Rhône-Alpes' },
  '13': { name: 'Bouches-du-Rhône', region: "Provence-Alpes-Côte d'Azur" },
  '28': { name: 'Eure-et-Loir', region: 'Centre-Val de Loire' },
  '31': { name: 'Haute-Garonne', region: 'Occitanie' },
  '33': { name: 'Gironde', region: 'Nouvelle-Aquitaine' },
  '44': { name: 'Loire-Atlantique', region: 'Pays de la Loire' },
  '59': { name: 'Nord', region: 'Hauts-de-France' },
  '69': { name: 'Rhône', region: 'Auvergne-Rhône-Alpes' },
  '75': { name: 'Paris', region: 'Île-de-France' },
  '77': { name: 'Seine-et-Marne', region: 'Île-de-France' },
  '78': { name: 'Yvelines', region: 'Île-de-France' },
  '91': { name: 'Essonne', region: 'Île-de-France' },
  '92': { name: 'Hauts-de-Seine', region: 'Île-de-France' },
  '93': { name: 'Seine-Saint-Denis', region: 'Île-de-France' },
  '94': { name: 'Val-de-Marne', region: 'Île-de-France' },
  '95': { name: 'Val-d\'Oise', region: 'Île-de-France' },
};

// Extended InterventionZone type with provider info for coverage API
interface CoverageZone {
  id: string;
  providerId: string;
  name: string;
  postalCodes: string[] | null;
  provider?: {
    id: string;
    name: string;
    status: string;
  };
  workTeamZoneAssignments?: Array<{
    workTeam?: {
      id: string;
      name: string;
      status: string;
      serviceTypes: string[];
    };
  }>;
}

interface Department {
  code: string;
  name: string;
  region: string;
  providers: number;
  zones: number;
  coverage: number;
  status: 'good' | 'warning' | 'critical';
  services: { name: string; providers: number }[];
  providerNames: string[];
}

type StatusFilter = 'all' | 'good' | 'warning' | 'critical';

// Helper to extract department code from postal code
const getDepartmentCode = (postalCode: string): string => {
  if (!postalCode) return '00';
  // Handle Corsica special case (20xxx -> 2A/2B)
  if (postalCode.startsWith('20')) {
    return postalCode.startsWith('201') ? '2A' : '2B';
  }
  // DOM-TOM (97x)
  if (postalCode.startsWith('97')) {
    return postalCode.substring(0, 3);
  }
  // Standard department (first 2 digits)
  return postalCode.substring(0, 2);
};

export default function PSMCoveragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  // Fetch intervention zones for coverage analysis
  const { data: zones, isLoading, error } = useQuery<CoverageZone[]>({
    queryKey: ['intervention-zones-coverage'],
    queryFn: () => providerService.getInterventionZonesForCoverage(),
  });

  // Aggregate zones into departments
  const departments = useMemo((): Department[] => {
    if (!zones || zones.length === 0) return [];

    const deptMap = new Map<string, {
      code: string;
      providers: Set<string>;
      providerNames: Set<string>;
      zones: number;
      serviceTypes: Set<string>;
    }>();

    for (const zone of zones) {
      const postalCodes = (zone.postalCodes || []) as string[];
      
      for (const pc of postalCodes) {
        const deptCode = getDepartmentCode(pc);
        
        if (!deptMap.has(deptCode)) {
          deptMap.set(deptCode, {
            code: deptCode,
            providers: new Set(),
            providerNames: new Set(),
            zones: 0,
            serviceTypes: new Set(),
          });
        }
        
        const dept = deptMap.get(deptCode)!;
        dept.providers.add(zone.providerId);
        if (zone.provider?.name) {
          dept.providerNames.add(zone.provider.name);
        }
        dept.zones++;
        
        // Collect service types from work team assignments
        if (zone.workTeamZoneAssignments) {
          for (const assignment of zone.workTeamZoneAssignments) {
            if (assignment.workTeam?.serviceTypes) {
              for (const st of assignment.workTeam.serviceTypes) {
                dept.serviceTypes.add(st);
              }
            }
          }
        }
      }
    }

    // Convert to array with computed coverage
    return Array.from(deptMap.values()).map(dept => {
      const providerCount = dept.providers.size;
      // Coverage based on provider density (arbitrary thresholds for demo)
      // In production, this would compare against required capacity
      const coverage = Math.min(100, providerCount * 25); // ~4 providers = 100%
      
      let status: 'good' | 'warning' | 'critical';
      if (coverage >= 90) status = 'good';
      else if (coverage >= 70) status = 'warning';
      else status = 'critical';

      const deptInfo = DEPARTMENT_NAMES[dept.code] || { 
        name: `Department ${dept.code}`, 
        region: 'Unknown Region' 
      };

      return {
        code: dept.code,
        name: deptInfo.name,
        region: deptInfo.region,
        providers: providerCount,
        zones: dept.zones,
        coverage,
        status,
        services: Array.from(dept.serviceTypes).map(st => ({
          name: st,
          providers: providerCount, // Simplified - in production would count per service
        })),
        providerNames: Array.from(dept.providerNames),
      };
    }).sort((a, b) => a.code.localeCompare(b.code));
  }, [zones]);

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.includes(searchQuery) ||
      dept.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => ({
    totalDepts: departments.length,
    avgCoverage: departments.length > 0 
      ? Math.round(departments.reduce((sum, d) => sum + d.coverage, 0) / departments.length)
      : 0,
    criticalGaps: departments.filter(d => d.status === 'critical').length,
    totalProviders: new Set(zones?.map(z => z.providerId) || []).size,
  }), [departments, zones]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Coverage Data</h2>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : 'Failed to load coverage data'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDepts}</div>
              <div className="text-sm text-gray-500">Departments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgCoverage}%</div>
              <div className="text-sm text-gray-500">Avg Coverage</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.criticalGaps}</div>
              <div className="text-sm text-gray-500">Critical Gaps</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProviders}</div>
              <div className="text-sm text-gray-500">Total Providers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Coverage Map</h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-gray-600">Good (90%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-gray-600">Warning (70-90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-gray-600">Critical (&lt;70%)</span>
            </div>
          </div>
        </div>
        <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>Interactive map visualization</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments, regions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'critical', 'warning', 'good'] as StatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading coverage data...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Coverage Data</h3>
          <p className="text-gray-600">No intervention zones have been configured yet.</p>
        </div>
      ) : (
        /* Department List */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredDepartments.map(dept => (
              <div key={dept.code}>
                <button
                  type="button"
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setExpandedDept(expandedDept === dept.code ? null : dept.code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white',
                        dept.status === 'good' && 'bg-green-500',
                        dept.status === 'warning' && 'bg-yellow-500',
                        dept.status === 'critical' && 'bg-red-500',
                      )}>
                        {dept.code}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{dept.name}</div>
                        <div className="text-sm text-gray-500">{dept.region}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Providers</div>
                        <div className="font-semibold text-gray-900">{dept.providers}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Zones</div>
                        <div className="font-semibold text-gray-900">{dept.zones}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Coverage</div>
                        <div className={clsx(
                          'font-semibold',
                          dept.coverage >= 90 && 'text-green-600',
                          dept.coverage >= 70 && dept.coverage < 90 && 'text-yellow-600',
                          dept.coverage < 70 && 'text-red-600',
                        )}>
                          {dept.coverage}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {dept.status === 'critical' && (
                          <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center gap-1">
                            <Plus className="w-4 h-4" />
                            Recruit
                          </span>
                        )}
                        <ChevronRight className={clsx(
                          'w-5 h-5 text-gray-400 transition-transform',
                          expandedDept === dept.code && 'rotate-90'
                        )} />
                      </div>
                    </div>
                  </div>
                </button>
                
                {expandedDept === dept.code && (
                  <div className="px-4 pb-4 bg-gray-50">
                    <div className="ml-16">
                      {/* Service Types */}
                      {dept.services.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {dept.services.map(service => (
                            <div key={service.name} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{service.name}</span>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  {service.providers}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Provider Names */}
                      {dept.providerNames.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-500 mb-2">Active Providers:</div>
                          <div className="flex flex-wrap gap-2">
                            {dept.providerNames.slice(0, 5).map(name => (
                              <span key={name} className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700">
                                {name}
                              </span>
                            ))}
                            {dept.providerNames.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-500">
                                +{dept.providerNames.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Providers
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Lead
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredDepartments.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500">
                No departments found matching your criteria
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
