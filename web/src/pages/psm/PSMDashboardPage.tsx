/**
 * PSM Dashboard Page
 * Provider recruitment pipeline overview
 */

import { useState } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  ChevronRight,
  Filter,
  Plus,
  Building2,
  Star,
} from 'lucide-react';
import clsx from 'clsx';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  value: number;
  color: string;
}

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  department: string;
  services: string[];
  stage: string;
  lastContact: string;
  score: number;
  urgency: 'low' | 'medium' | 'high';
}

const pipelineStages: PipelineStage[] = [
  { id: 'prospecting', name: 'Prospecting', count: 45, value: 135000, color: 'bg-gray-500' },
  { id: 'contacted', name: 'Contacted', count: 28, value: 84000, color: 'bg-blue-500' },
  { id: 'meeting', name: 'Meeting Scheduled', count: 15, value: 45000, color: 'bg-purple-500' },
  { id: 'negotiation', name: 'Negotiation', count: 8, value: 24000, color: 'bg-orange-500' },
  { id: 'onboarding', name: 'Onboarding', count: 5, value: 15000, color: 'bg-green-500' },
];

const mockLeads: Lead[] = [
  {
    id: '1',
    companyName: 'Plomberie Express Lyon',
    contactName: 'Pierre Martin',
    phone: '+33 6 12 34 56 78',
    email: 'p.martin@plomberie-express.fr',
    department: '69 - Rhône',
    services: ['Plomberie', 'Chauffage'],
    stage: 'meeting',
    lastContact: '2 hours ago',
    score: 85,
    urgency: 'high',
  },
  {
    id: '2',
    companyName: 'Électricité Verte',
    contactName: 'Marie Dubois',
    phone: '+33 6 23 45 67 89',
    email: 'm.dubois@elec-verte.fr',
    department: '75 - Paris',
    services: ['Électricité', 'Domotique'],
    stage: 'contacted',
    lastContact: '1 day ago',
    score: 72,
    urgency: 'medium',
  },
  {
    id: '3',
    companyName: 'Isolation Pro 33',
    contactName: 'Jean-Luc Bernard',
    phone: '+33 6 34 56 78 90',
    email: 'jl.bernard@iso-pro.fr',
    department: '33 - Gironde',
    services: ['Isolation', 'Menuiserie'],
    stage: 'negotiation',
    lastContact: '3 hours ago',
    score: 92,
    urgency: 'high',
  },
  {
    id: '4',
    companyName: 'Clim Services Marseille',
    contactName: 'Sophie Roux',
    phone: '+33 6 45 67 89 01',
    email: 's.roux@clim-services.fr',
    department: '13 - Bouches-du-Rhône',
    services: ['Climatisation', 'Chauffage'],
    stage: 'prospecting',
    lastContact: '5 days ago',
    score: 45,
    urgency: 'low',
  },
];

const metrics = {
  totalLeads: 101,
  conversionRate: 15.2,
  avgDealSize: 3200,
  monthlyTarget: 25,
  monthlyActual: 18,
};

export default function PSMDashboardPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const filteredLeads = selectedStage
    ? mockLeads.filter(l => l.stage === selectedStage)
    : mockLeads;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalLeads}</div>
              <div className="text-sm text-gray-500">Total Leads</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">€{metrics.avgDealSize}</div>
              <div className="text-sm text-gray-500">Avg Deal Size</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.monthlyActual}/{metrics.monthlyTarget}</div>
              <div className="text-sm text-gray-500">Monthly Target</div>
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(metrics.monthlyActual / metrics.monthlyTarget) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recruitment Pipeline</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
        
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStage(null)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              !selectedStage ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            All ({mockLeads.length})
          </button>
          {pipelineStages.map(stage => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedStage === stage.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {stage.name} ({stage.count})
            </button>
          ))}
        </div>

        {/* Pipeline Visualization */}
        <div className="flex gap-1 h-12 rounded-lg overflow-hidden">
          {pipelineStages.map((stage) => {
            const width = (stage.count / pipelineStages.reduce((s, st) => s + st.count, 0)) * 100;
            return (
              <div
                key={stage.id}
                className={clsx(stage.color, 'flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity')}
                style={{ width: `${width}%` }}
                onClick={() => setSelectedStage(stage.id)}
                title={`${stage.name}: ${stage.count} leads`}
              >
                {width > 10 && stage.count}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedStage ? pipelineStages.find(s => s.id === selectedStage)?.name : 'All Leads'}
          </h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredLeads.map(lead => (
            <div key={lead.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{lead.companyName}</h3>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      lead.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      lead.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {lead.urgency === 'high' && '🔥 Hot'}
                      {lead.urgency === 'medium' && '⚡ Warm'}
                      {lead.urgency === 'low' && 'Cold'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {lead.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {lead.lastContact}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {lead.services.map(service => (
                      <span key={service} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {lead.score}
                    </div>
                    <div className="text-xs text-gray-500">Lead Score</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`mailto:${lead.email}`}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Follow-up Required</div>
              <div className="text-sm text-gray-500">12 leads need attention</div>
            </div>
          </div>
        </button>
        
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Ready for Onboarding</div>
              <div className="text-sm text-gray-500">5 providers approved</div>
            </div>
          </div>
        </button>
        
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Coverage Gaps</div>
              <div className="text-sm text-gray-500">8 zones need providers</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
