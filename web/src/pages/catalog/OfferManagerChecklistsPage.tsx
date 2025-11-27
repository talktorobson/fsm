/**
 * Offer Manager Checklists Page
 * Manage service checklists and quality control items
 */

import { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Camera,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

interface ChecklistItem {
  id: string;
  text: string;
  type: 'mandatory' | 'optional';
  requiresPhoto: boolean;
  requiresNote: boolean;
}

interface Checklist {
  id: string;
  name: string;
  category: string;
  description: string;
  items: ChecklistItem[];
  usedBy: number; // number of services using this checklist
  lastUpdated: string;
}

const mockChecklists: Checklist[] = [
  {
    id: '1',
    name: 'Electrical Safety Checklist',
    category: 'Électricité',
    description: 'Standard safety checks for all electrical work',
    items: [
      { id: '1-1', text: 'Verify power is disconnected', type: 'mandatory', requiresPhoto: false, requiresNote: false },
      { id: '1-2', text: 'Test circuit breakers', type: 'mandatory', requiresPhoto: true, requiresNote: true },
      { id: '1-3', text: 'Check grounding', type: 'mandatory', requiresPhoto: true, requiresNote: false },
      { id: '1-4', text: 'Inspect wiring insulation', type: 'mandatory', requiresPhoto: true, requiresNote: true },
      { id: '1-5', text: 'Label all circuits', type: 'optional', requiresPhoto: false, requiresNote: false },
    ],
    usedBy: 8,
    lastUpdated: '3 days ago',
  },
  {
    id: '2',
    name: 'Heat Pump Installation',
    category: 'Chauffage',
    description: 'Complete checklist for heat pump installation',
    items: [
      { id: '2-1', text: 'Site preparation complete', type: 'mandatory', requiresPhoto: true, requiresNote: false },
      { id: '2-2', text: 'Unit positioned correctly', type: 'mandatory', requiresPhoto: true, requiresNote: false },
      { id: '2-3', text: 'Refrigerant lines connected', type: 'mandatory', requiresPhoto: true, requiresNote: true },
      { id: '2-4', text: 'Electrical connections verified', type: 'mandatory', requiresPhoto: true, requiresNote: false },
      { id: '2-5', text: 'System tested and operational', type: 'mandatory', requiresPhoto: false, requiresNote: true },
      { id: '2-6', text: 'Customer demonstration complete', type: 'optional', requiresPhoto: false, requiresNote: true },
    ],
    usedBy: 3,
    lastUpdated: '1 week ago',
  },
  {
    id: '3',
    name: 'Insulation Quality Check',
    category: 'Isolation',
    description: 'Quality verification for insulation work',
    items: [
      { id: '3-1', text: 'Area properly prepared', type: 'mandatory', requiresPhoto: true, requiresNote: false },
      { id: '3-2', text: 'Insulation thickness correct', type: 'mandatory', requiresPhoto: true, requiresNote: true },
      { id: '3-3', text: 'No gaps or compression', type: 'mandatory', requiresPhoto: true, requiresNote: false },
      { id: '3-4', text: 'Vapor barrier installed', type: 'mandatory', requiresPhoto: true, requiresNote: false },
    ],
    usedBy: 5,
    lastUpdated: '2 weeks ago',
  },
];

const categories = ['All', 'Électricité', 'Chauffage', 'Isolation', 'Plomberie'];

export default function OfferManagerChecklistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredChecklists = mockChecklists.filter(checklist => {
    const matchesSearch = checklist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checklist.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || checklist.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{mockChecklists.length}</div>
              <div className="text-sm text-gray-500">Total Checklists</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {mockChecklists.reduce((sum, c) => sum + c.items.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {mockChecklists.reduce((sum, c) => sum + c.usedBy, 0)}
              </div>
              <div className="text-sm text-gray-500">Service Usages</div>
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
              placeholder="Search checklists..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Checklist
          </button>
        </div>
      </div>

      {/* Checklists */}
      <div className="space-y-4">
        {filteredChecklists.map(checklist => (
          <div
            key={checklist.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedChecklist(
                expandedChecklist === checklist.id ? null : checklist.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ChevronRight className={clsx(
                    'w-5 h-5 text-gray-400 transition-transform',
                    expandedChecklist === checklist.id && 'rotate-90'
                  )} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{checklist.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {checklist.category}
                      </span>
                      <span>{checklist.items.length} items</span>
                      <span>Used by {checklist.usedBy} services</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Updated {checklist.lastUpdated}</span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(showActions === checklist.id ? null : checklist.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {showActions === checklist.id && (
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
              </div>
            </div>

            {expandedChecklist === checklist.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">{checklist.description}</p>
                
                <div className="space-y-2">
                  {checklist.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-gray-900">{item.text}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={clsx(
                            'px-1.5 py-0.5 rounded text-xs',
                            item.type === 'mandatory' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          )}>
                            {item.type}
                          </span>
                          {item.requiresPhoto && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Camera className="w-3 h-3" />
                              Photo
                            </span>
                          )}
                          {item.requiresNote && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FileText className="w-3 h-3" />
                              Note
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredChecklists.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No checklists found</h3>
          <p className="text-gray-500 mb-4">
            Create a new checklist to get started
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Create Checklist
          </button>
        </div>
      )}
    </div>
  );
}
