/**
 * PSM Coverage Page
 * Geographic coverage analysis and gap identification
 */

import { useState } from 'react';
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
} from 'lucide-react';
import clsx from 'clsx';

interface Department {
  code: string;
  name: string;
  region: string;
  providers: number;
  requiredProviders: number;
  coverage: number;
  status: 'good' | 'warning' | 'critical';
  services: { name: string; providers: number; needed: number }[];
  demand: number;
  trend: 'up' | 'down' | 'stable';
}

const mockDepartments: Department[] = [
  {
    code: '69',
    name: 'Rhône',
    region: 'Auvergne-Rhône-Alpes',
    providers: 45,
    requiredProviders: 40,
    coverage: 112,
    status: 'good',
    services: [
      { name: 'Électricité', providers: 12, needed: 10 },
      { name: 'Plomberie', providers: 15, needed: 12 },
      { name: 'Chauffage', providers: 8, needed: 8 },
      { name: 'Isolation', providers: 10, needed: 10 },
    ],
    demand: 850,
    trend: 'up',
  },
  {
    code: '75',
    name: 'Paris',
    region: 'Île-de-France',
    providers: 38,
    requiredProviders: 50,
    coverage: 76,
    status: 'warning',
    services: [
      { name: 'Électricité', providers: 10, needed: 15 },
      { name: 'Plomberie', providers: 12, needed: 15 },
      { name: 'Chauffage', providers: 8, needed: 10 },
      { name: 'Isolation', providers: 8, needed: 10 },
    ],
    demand: 1200,
    trend: 'up',
  },
  {
    code: '13',
    name: 'Bouches-du-Rhône',
    region: 'Provence-Alpes-Côte d\'Azur',
    providers: 22,
    requiredProviders: 35,
    coverage: 63,
    status: 'critical',
    services: [
      { name: 'Électricité', providers: 5, needed: 10 },
      { name: 'Plomberie', providers: 8, needed: 10 },
      { name: 'Chauffage', providers: 4, needed: 8 },
      { name: 'Climatisation', providers: 5, needed: 7 },
    ],
    demand: 720,
    trend: 'up',
  },
  {
    code: '33',
    name: 'Gironde',
    region: 'Nouvelle-Aquitaine',
    providers: 28,
    requiredProviders: 30,
    coverage: 93,
    status: 'good',
    services: [
      { name: 'Électricité', providers: 8, needed: 8 },
      { name: 'Plomberie', providers: 9, needed: 9 },
      { name: 'Chauffage', providers: 6, needed: 7 },
      { name: 'Isolation', providers: 5, needed: 6 },
    ],
    demand: 580,
    trend: 'stable',
  },
  {
    code: '31',
    name: 'Haute-Garonne',
    region: 'Occitanie',
    providers: 18,
    requiredProviders: 28,
    coverage: 64,
    status: 'critical',
    services: [
      { name: 'Électricité', providers: 4, needed: 8 },
      { name: 'Plomberie', providers: 6, needed: 8 },
      { name: 'Chauffage', providers: 4, needed: 6 },
      { name: 'Isolation', providers: 4, needed: 6 },
    ],
    demand: 490,
    trend: 'up',
  },
  {
    code: '44',
    name: 'Loire-Atlantique',
    region: 'Pays de la Loire',
    providers: 20,
    requiredProviders: 22,
    coverage: 91,
    status: 'good',
    services: [
      { name: 'Électricité', providers: 6, needed: 6 },
      { name: 'Plomberie', providers: 6, needed: 6 },
      { name: 'Chauffage', providers: 5, needed: 5 },
      { name: 'Isolation', providers: 3, needed: 5 },
    ],
    demand: 420,
    trend: 'stable',
  },
];

type StatusFilter = 'all' | 'good' | 'warning' | 'critical';

export default function PSMCoveragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const filteredDepartments = mockDepartments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.includes(searchQuery) ||
      dept.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDepts: mockDepartments.length,
    avgCoverage: Math.round(mockDepartments.reduce((sum, d) => sum + d.coverage, 0) / mockDepartments.length),
    criticalGaps: mockDepartments.filter(d => d.status === 'critical').length,
    totalProviders: mockDepartments.reduce((sum, d) => sum + d.providers, 0),
  };

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

      {/* Department List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredDepartments.map(dept => (
            <div key={dept.code}>
              <div
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
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
                      <div className="font-semibold text-gray-900">
                        {dept.providers}/{dept.requiredProviders}
                      </div>
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
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Demand</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        {dept.demand}/mo
                        {dept.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {dept.status === 'critical' && (
                        <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          Recruit
                        </button>
                      )}
                      <ChevronRight className={clsx(
                        'w-5 h-5 text-gray-400 transition-transform',
                        expandedDept === dept.code && 'rotate-90'
                      )} />
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedDept === dept.code && (
                <div className="px-4 pb-4 bg-gray-50">
                  <div className="ml-16 grid grid-cols-4 gap-4">
                    {dept.services.map(service => (
                      <div key={service.name} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{service.name}</span>
                          <span className={clsx(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            service.providers >= service.needed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          )}>
                            {service.providers >= service.needed ? (
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                            )}
                            {service.providers}/{service.needed}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full',
                              service.providers >= service.needed ? 'bg-green-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.min(100, (service.providers / service.needed) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="ml-16 mt-4 flex gap-2">
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
