/**
 * Provider Teams Page
 * Manage work teams and technicians
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  ChevronRight,
  Settings,
  User,
} from 'lucide-react';
import clsx from 'clsx';

interface TeamMember {
  id: string;
  name: string;
  role: 'lead' | 'technician';
  phone: string;
  email: string;
  certifications: string[];
  rating: number;
  jobsCompleted: number;
  status: 'available' | 'on_job' | 'off_duty' | 'vacation';
  currentJob?: string;
  avatar?: string;
}

interface WorkTeam {
  id: string;
  name: string;
  zone: string;
  status: 'active' | 'inactive' | 'on_vacation';
  members: TeamMember[];
  activeJobs: number;
  completedThisMonth: number;
  rating: number;
}

const mockTeams: WorkTeam[] = [
  {
    id: 'WT-001',
    name: 'Équipe Paris Centre',
    zone: '75001-75004',
    status: 'active',
    members: [
      {
        id: 'TM-001',
        name: 'Marc Lefebvre',
        role: 'lead',
        phone: '06 12 34 56 78',
        email: 'marc.lefebvre@elecpro.fr',
        certifications: ['Habilitation BR', 'NFC 15-100'],
        rating: 4.9,
        jobsCompleted: 234,
        status: 'on_job',
        currentJob: 'SO-2024-001',
      },
      {
        id: 'TM-002',
        name: 'Julie Durand',
        role: 'technician',
        phone: '06 23 45 67 89',
        email: 'julie.durand@elecpro.fr',
        certifications: ['Habilitation B1V', 'Fibre optique'],
        rating: 4.7,
        jobsCompleted: 156,
        status: 'on_job',
        currentJob: 'SO-2024-001',
      },
    ],
    activeJobs: 3,
    completedThisMonth: 28,
    rating: 4.8,
  },
  {
    id: 'WT-002',
    name: 'Équipe Paris Ouest',
    zone: '75015-75016',
    status: 'active',
    members: [
      {
        id: 'TM-003',
        name: 'Pierre Martin',
        role: 'lead',
        phone: '06 34 56 78 90',
        email: 'pierre.martin@elecpro.fr',
        certifications: ['Habilitation BR', 'NFC 15-100', 'Photovoltaïque'],
        rating: 4.6,
        jobsCompleted: 189,
        status: 'available',
      },
      {
        id: 'TM-004',
        name: 'Sophie Blanc',
        role: 'technician',
        phone: '06 45 67 89 01',
        email: 'sophie.blanc@elecpro.fr',
        certifications: ['Habilitation B1V'],
        rating: 4.5,
        jobsCompleted: 98,
        status: 'available',
      },
    ],
    activeJobs: 1,
    completedThisMonth: 22,
    rating: 4.5,
  },
  {
    id: 'WT-003',
    name: 'Équipe Paris Est',
    zone: '75010-75012',
    status: 'inactive',
    members: [
      {
        id: 'TM-005',
        name: 'Thomas Petit',
        role: 'lead',
        phone: '06 56 78 90 12',
        email: 'thomas.petit@elecpro.fr',
        certifications: ['Habilitation BR'],
        rating: 4.4,
        jobsCompleted: 145,
        status: 'vacation',
      },
    ],
    activeJobs: 0,
    completedThisMonth: 15,
    rating: 4.4,
  },
];

const statusConfig = {
  available: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  on_job: { label: 'On Job', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  off_duty: { label: 'Off Duty', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  vacation: { label: 'On Vacation', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

const teamStatusConfig = {
  active: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  inactive: { label: 'Inactive', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  on_vacation: { label: 'On Vacation', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

function TeamCard({ team }: { team: WorkTeam }) {
  const teamStatus = teamStatusConfig[team.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-500">Zone: {team.zone}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', teamStatus.bgColor, teamStatus.color)}>
            {teamStatus.label}
          </span>
          <Link to={`/provider/teams/${team.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 px-5 py-3">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{team.members.length}</p>
          <p className="text-xs text-gray-500">Members</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{team.activeJobs}</p>
          <p className="text-xs text-gray-500">Active Jobs</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-bold text-gray-900">{team.rating}</span>
          </div>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>

      {/* Members */}
      <div className="p-5">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Team Members</h4>
        <div className="space-y-3">
          {team.members.map(member => {
            const status = statusConfig[member.status];
            return (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      {member.role === 'lead' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Lead</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', status.bgColor, status.color)}>
                        {status.label}
                      </span>
                      {member.currentJob && (
                        <span className="text-xs text-gray-500">• {member.currentJob}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{member.rating}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">{team.completedThisMonth} jobs this month</span>
        <Link
          to={`/provider/teams/${team.id}`}
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          Manage Team <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function ProviderTeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setShowAddModal] = useState(false);

  const filteredTeams = mockTeams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.zone.includes(searchQuery) ||
    team.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalMembers = mockTeams.reduce((sum, team) => sum + team.members.length, 0);
  const activeTeams = mockTeams.filter(t => t.status === 'active').length;
  const availableMembers = mockTeams.reduce(
    (sum, team) => sum + team.members.filter(m => m.status === 'available').length, 
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Teams</h1>
          <p className="text-gray-500 mt-1">Manage your teams and technicians</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockTeams.length}</p>
              <p className="text-sm text-gray-500">Total Teams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeTeams}</p>
              <p className="text-sm text-gray-500">Active Teams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{availableMembers}</p>
              <p className="text-sm text-gray-500">Available Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams or members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTeams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No teams found</h3>
          <p className="text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first work team to get started'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Team
          </button>
        </div>
      )}
    </div>
  );
}
