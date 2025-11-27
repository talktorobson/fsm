/**
 * Offer Manager Pricing Page
 * Manage pricing rules, regional pricing, and discounts
 */

import { useState } from 'react';
import {
  Euro,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  MapPin,
  Percent,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import clsx from 'clsx';

interface PricingRule {
  id: string;
  name: string;
  type: 'base' | 'regional' | 'seasonal' | 'volume';
  service: string;
  basePrice: number;
  modifier: number;
  modifierType: 'percentage' | 'fixed';
  regions?: string[];
  validFrom?: string;
  validTo?: string;
  minQuantity?: number;
  status: 'active' | 'inactive' | 'scheduled';
}

const mockPricingRules: PricingRule[] = [
  {
    id: '1',
    name: 'Base Installation Price',
    type: 'base',
    service: 'Pompe à Chaleur',
    basePrice: 4500,
    modifier: 0,
    modifierType: 'fixed',
    status: 'active',
  },
  {
    id: '2',
    name: 'Île-de-France Premium',
    type: 'regional',
    service: 'Pompe à Chaleur',
    basePrice: 4500,
    modifier: 15,
    modifierType: 'percentage',
    regions: ['75', '92', '93', '94'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Winter Season Rate',
    type: 'seasonal',
    service: 'Pompe à Chaleur',
    basePrice: 4500,
    modifier: 10,
    modifierType: 'percentage',
    validFrom: '2024-11-01',
    validTo: '2025-02-28',
    status: 'scheduled',
  },
  {
    id: '4',
    name: 'Bulk Installation Discount',
    type: 'volume',
    service: 'Isolation Combles',
    basePrice: 35,
    modifier: -20,
    modifierType: 'percentage',
    minQuantity: 100,
    status: 'active',
  },
  {
    id: '5',
    name: 'Rural Zone Discount',
    type: 'regional',
    service: 'Panneau Solaire',
    basePrice: 8500,
    modifier: -10,
    modifierType: 'percentage',
    regions: ['Zones Rurales'],
    status: 'active',
  },
];

const typeLabels = {
  base: { label: 'Base', color: 'bg-gray-100 text-gray-700' },
  regional: { label: 'Regional', color: 'bg-blue-100 text-blue-700' },
  seasonal: { label: 'Seasonal', color: 'bg-orange-100 text-orange-700' },
  volume: { label: 'Volume', color: 'bg-purple-100 text-purple-700' },
};

const statusLabels = {
  active: { label: 'Active', color: 'text-green-600', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'text-gray-400', icon: XCircle },
  scheduled: { label: 'Scheduled', color: 'text-blue-600', icon: Calendar },
};

export default function OfferManagerPricingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'rules' | 'regions' | 'history'>('rules');
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredRules = mockPricingRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || rule.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const stats = {
    totalRules: mockPricingRules.length,
    activeRules: mockPricingRules.filter(r => r.status === 'active').length,
    avgModifier: Math.round(
      mockPricingRules
        .filter(r => r.modifier !== 0)
        .reduce((sum, r) => sum + Math.abs(r.modifier), 0) /
      mockPricingRules.filter(r => r.modifier !== 0).length
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRules}</div>
              <div className="text-sm text-gray-500">Pricing Rules</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.activeRules}</div>
              <div className="text-sm text-gray-500">Active Rules</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgModifier}%</div>
              <div className="text-sm text-gray-500">Avg. Modifier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            {['rules', 'regions', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize',
                  activeTab === tab
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                {tab === 'rules' ? 'Pricing Rules' : tab === 'regions' ? 'Regional Settings' : 'Price History'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'rules' && (
          <div className="p-4">
            {/* Filters */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pricing rules..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="base">Base</option>
                  <option value="regional">Regional</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="volume">Volume</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            {/* Rules Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rule Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Service</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Base Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Modifier</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map(rule => {
                    const StatusIcon = statusLabels[rule.status].icon;
                    return (
                      <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium text-gray-900">{rule.name}</span>
                            {rule.regions && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {rule.regions.slice(0, 3).join(', ')}
                                {rule.regions.length > 3 && ` +${rule.regions.length - 3}`}
                              </div>
                            )}
                            {rule.validFrom && rule.validTo && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {rule.validFrom} → {rule.validTo}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={clsx(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            typeLabels[rule.type].color
                          )}>
                            {typeLabels[rule.type].label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{rule.service}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          €{rule.basePrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {rule.modifier !== 0 && (
                            <span className={clsx(
                              'flex items-center justify-end gap-1 font-medium',
                              rule.modifier > 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {rule.modifier > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {rule.modifier > 0 ? '+' : ''}{rule.modifier}
                              {rule.modifierType === 'percentage' ? '%' : '€'}
                            </span>
                          )}
                          {rule.modifier === 0 && (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <StatusIcon className={clsx('w-4 h-4', statusLabels[rule.status].color)} />
                            <span className={clsx('text-sm', statusLabels[rule.status].color)}>
                              {statusLabels[rule.status].label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end">
                            <div className="relative">
                              <button
                                onClick={() => setShowActions(showActions === rule.id ? null : rule.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                              
                              {showActions === rule.id && (
                                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                                  <button className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Copy className="w-4 h-4" />
                                    Duplicate
                                  </button>
                                  <hr className="my-1" />
                                  <button className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Region Map Placeholder */}
              <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Regional Pricing Map</p>
                  <p className="text-sm text-gray-500 mt-1">Interactive map coming soon</p>
                </div>
              </div>

              {/* Region List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Regional Modifiers</h3>
                
                {[
                  { region: 'Île-de-France', modifier: '+15%', services: 12 },
                  { region: 'PACA', modifier: '+10%', services: 8 },
                  { region: 'Rural Zones', modifier: '-10%', services: 15 },
                  { region: 'DOM-TOM', modifier: '+25%', services: 5 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-medium text-gray-900">{item.region}</span>
                        <p className="text-sm text-gray-500">{item.services} services affected</p>
                      </div>
                    </div>
                    <span className={clsx(
                      'font-semibold',
                      item.modifier.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    )}>
                      {item.modifier}
                    </span>
                  </div>
                ))}

                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Region
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Recent Price Changes</h3>
              
              {[
                { date: '2024-01-15', action: 'Updated', rule: 'Base Installation Price', change: '€4,200 → €4,500', user: 'Marie D.' },
                { date: '2024-01-10', action: 'Created', rule: 'Winter Season Rate', change: '+10% seasonal', user: 'Jean P.' },
                { date: '2024-01-05', action: 'Deactivated', rule: 'Holiday Discount', change: '20% off → Inactive', user: 'Marie D.' },
                { date: '2023-12-20', action: 'Updated', rule: 'Île-de-France Premium', change: '+12% → +15%', user: 'Admin' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                      <Euro className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          item.action === 'Created' && 'bg-green-100 text-green-700',
                          item.action === 'Updated' && 'bg-blue-100 text-blue-700',
                          item.action === 'Deactivated' && 'bg-gray-100 text-gray-700'
                        )}>
                          {item.action}
                        </span>
                        <span className="font-medium text-gray-900">{item.rule}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.change}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="text-sm text-gray-400">by {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800">Pricing changes require approval</h4>
          <p className="text-sm text-amber-700 mt-1">
            Any changes to base prices or regional modifiers exceeding 10% will require manager approval before becoming active.
          </p>
        </div>
      </div>
    </div>
  );
}
