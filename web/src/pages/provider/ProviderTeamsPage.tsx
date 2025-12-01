/**
 * Provider Teams Page
 * Manage work teams and technicians
 */

import { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { providerService } from '@/services/provider-service';
import { WorkTeam, Technician, WorkTeamStatus } from '@/types';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  on_job: { label: 'On Job', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  off_duty: { label: 'Off Duty', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  vacation: { label: 'On Vacation', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  ON_VACATION: { label: 'On Vacation', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  SUSPENDED: { label: 'Suspended', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const teamStatusConfig: Record<WorkTeamStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
  INACTIVE: { label: 'Inactive', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  ON_LEAVE: { label: 'On Leave', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  SUSPENDED: { label: 'Suspended', color: 'text-red-700', bgColor: 'bg-red-100' },
};

function TeamCard({ team, technicians }: { team: WorkTeam; technicians: Technician[] }) {
  const teamStatus = teamStatusConfig[team.status] || statusConfig.INACTIVE;

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
              <span className="text-sm text-gray-500">
                {team.postalCodes?.length > 0 ? `Zones: ${team.postalCodes.slice(0, 3).join(', ')}${team.postalCodes.length > 3 ? '...' : ''}` : 'No zones assigned'}
              </span>
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
          <p className="text-xl font-bold text-gray-900">{technicians.length}</p>
          <p className="text-xs text-gray-500">Members</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{team.maxDailyJobs}</p>
          <p className="text-xs text-gray-500">Max Jobs/Day</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-bold text-gray-900">-</span>
          </div>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>

      {/* Members */}
      <div className="p-5">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Team Members</h4>
        {technicians.length > 0 ? (
          <div className="space-y-3">
            {technicians.slice(0, 4).map(member => {
              return (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{member.firstName} {member.lastName}</span>
                        {member.isTeamLead && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Lead</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{member.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {technicians.length > 4 && (
              <p className="text-sm text-gray-500 text-center">+{technicians.length - 4} more members</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">No technicians assigned</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">{team.skills?.length || 0} skills configured</span>
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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [, setShowAddModal] = useState(false);
  const [teams, setTeams] = useState<WorkTeam[]>([]);
  const [teamTechnicians, setTeamTechnicians] = useState<Record<string, Technician[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user?.providerId) {
        setError('Provider context not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch work teams for the provider
        const workTeams = await providerService.getWorkTeams(user.providerId);
        setTeams(workTeams);

        // Fetch technicians for each team
        const techniciansMap: Record<string, Technician[]> = {};
        await Promise.all(
          workTeams.map(async (team) => {
            try {
              const technicians = await providerService.getTechnicians(team.id);
              techniciansMap[team.id] = technicians;
            } catch {
              techniciansMap[team.id] = [];
            }
          })
        );
        setTeamTechnicians(techniciansMap);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError('Failed to load teams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user?.providerId]);

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.postalCodes?.some(code => code.includes(searchQuery)) ||
    teamTechnicians[team.id]?.some(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalMembers = Object.values(teamTechnicians).reduce((sum, techs) => sum + techs.length, 0);
  const activeTeams = teams.filter(t => t.status === 'ACTIVE').length;
  // Count technicians from active teams as "available"
  const availableMembers = teams
    .filter(t => t.status === 'ACTIVE')
    .reduce((sum, team) => sum + (teamTechnicians[team.id]?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{error}</h3>
        {!user?.providerId && (
          <p className="text-gray-500 mt-2">You must be logged in as a provider to view teams.</p>
        )}
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
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
            <TeamCard key={team.id} team={team} technicians={teamTechnicians[team.id] || []} />
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
