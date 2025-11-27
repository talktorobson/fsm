/**
 * PSM Providers Page
 * Manage onboarded providers
 */

import { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Search,
  Download,
  Eye,
  Edit,
  Pause,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';

interface Provider {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  department: string;
  services: string[];
  status: 'active' | 'onboarding' | 'suspended' | 'churned';
  rating: number;
  totalJobs: number;
  monthlyJobs: number;
  trend: 'up' | 'down' | 'stable';
  onboardedDate: string;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  commission: number;
}

const mockProviders: Provider[] = [
  {
    id: '1',
    companyName: 'Électricité Plus SARL',
    contactName: 'Marc Lefebvre',
    phone: '+33 6 12 34 56 78',
    email: 'm.lefebvre@elec-plus.fr',
    department: '69 - Rhône',
    services: ['Électricité', 'Domotique'],
    status: 'active',
    rating: 4.8,
    totalJobs: 342,
    monthlyJobs: 28,
    trend: 'up',
    onboardedDate: '2024-03-15',
    lastActivity: '2 hours ago',
    riskLevel: 'low',
    commission: 12,
  },
  {
    id: '2',
    companyName: 'Plomberie Express Lyon',
    contactName: 'Pierre Martin',
    phone: '+33 6 23 45 67 89',
    email: 'p.martin@plomb-express.fr',
    department: '69 - Rhône',
    services: ['Plomberie', 'Chauffage'],
    status: 'active',
    rating: 4.5,
    totalJobs: 215,
    monthlyJobs: 18,
    trend: 'stable',
    onboardedDate: '2024-06-01',
    lastActivity: '1 day ago',
    riskLevel: 'low',
    commission: 10,
  },
  {
    id: '3',
    companyName: 'Chauffage Plus',
    contactName: 'Marc Leroy',
    phone: '+33 6 67 89 01 23',
    email: 'm.leroy@chauffage-plus.fr',
    department: '44 - Loire-Atlantique',
    services: ['Chauffage', 'Pompe à chaleur'],
    status: 'onboarding',
    rating: 0,
    totalJobs: 0,
    monthlyJobs: 0,
    trend: 'stable',
    onboardedDate: '2025-11-28',
    lastActivity: 'Just now',
    riskLevel: 'medium',
    commission: 11,
  },
  {
    id: '4',
    companyName: 'Isolation Pro 33',
    contactName: 'Jean-Luc Bernard',
    phone: '+33 6 34 56 78 90',
    email: 'jl.bernard@iso-pro.fr',
    department: '33 - Gironde',
    services: ['Isolation', 'Menuiserie'],
    status: 'active',
    rating: 3.9,
    totalJobs: 89,
    monthlyJobs: 5,
    trend: 'down',
    onboardedDate: '2024-09-10',
    lastActivity: '1 week ago',
    riskLevel: 'high',
    commission: 10,
  },
  {
    id: '5',
    companyName: 'Dépannage 24h',
    contactName: 'André Duval',
    phone: '+33 6 78 90 12 34',
    email: 'a.duval@depannage24.fr',
    department: '13 - Bouches-du-Rhône',
    services: ['Serrurerie', 'Vitrerie'],
    status: 'suspended',
    rating: 2.8,
    totalJobs: 45,
    monthlyJobs: 0,
    trend: 'down',
    onboardedDate: '2024-07-20',
    lastActivity: '2 weeks ago',
    riskLevel: 'high',
    commission: 8,
  },
];

type StatusFilter = 'all' | 'active' | 'onboarding' | 'suspended' | 'churned';

export default function PSMProvidersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockProviders.length,
    active: mockProviders.filter(p => p.status === 'active').length,
    onboarding: mockProviders.filter(p => p.status === 'onboarding').length,
    atRisk: mockProviders.filter(p => p.riskLevel === 'high').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Providers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.onboarding}</div>
              <div className="text-sm text-gray-500">Onboarding</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.atRisk}</div>
              <div className="text-sm text-gray-500">At Risk</div>
            </div>
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
              placeholder="Search providers, departments, services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'active', 'onboarding', 'suspended'] as StatusFilter[]).map(status => (
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

      {/* Providers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commission</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProviders.map(provider => (
                <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{provider.companyName}</div>
                        <div className="text-sm text-gray-500">{provider.contactName}</div>
                        <div className="flex gap-1 mt-1">
                          {provider.services.slice(0, 2).map(service => (
                            <span key={service} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                              {service}
                            </span>
                          ))}
                          {provider.services.length > 2 && (
                            <span className="text-xs text-gray-400">+{provider.services.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      provider.status === 'active' && 'bg-green-100 text-green-700',
                      provider.status === 'onboarding' && 'bg-purple-100 text-purple-700',
                      provider.status === 'suspended' && 'bg-red-100 text-red-700',
                      provider.status === 'churned' && 'bg-gray-100 text-gray-600',
                    )}>
                      {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {provider.department}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-gray-900">
                          {provider.rating > 0 ? provider.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {provider.monthlyJobs}/mo
                        {provider.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 inline ml-1" />}
                        {provider.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 inline ml-1" />}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      provider.riskLevel === 'low' && 'bg-green-100 text-green-700',
                      provider.riskLevel === 'medium' && 'bg-yellow-100 text-yellow-700',
                      provider.riskLevel === 'high' && 'bg-red-100 text-red-700',
                    )}>
                      {provider.riskLevel.charAt(0).toUpperCase() + provider.riskLevel.slice(1)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">{provider.commission}%</span>
                  </td>
                  
                  <td className="px-4 py-4 text-right relative">
                    <button
                      onClick={() => setShowActions(showActions === provider.id ? null : provider.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {showActions === provider.id && (
                      <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Provider
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact
                        </button>
                        <hr className="my-1" />
                        {provider.status === 'active' ? (
                          <button className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                            <Pause className="w-4 h-4" />
                            Suspend
                          </button>
                        ) : (
                          <button className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </button>
                        )}
                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Terminate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
