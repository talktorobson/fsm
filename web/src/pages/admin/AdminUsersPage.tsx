/**
 * Admin Users Page
 * User management and administration
 */

import { useState } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  UserPlus,
} from 'lucide-react';
import clsx from 'clsx';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  department?: string;
  providerId?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@ahs.fr',
    role: 'Admin',
    status: 'active',
    lastLogin: '2 hours ago',
    createdAt: '2024-01-15',
    department: 'IT',
  },
  {
    id: '2',
    name: 'Marie Laurent',
    email: 'marie.laurent@ahs.fr',
    role: 'PSM',
    status: 'active',
    lastLogin: '1 day ago',
    createdAt: '2024-03-20',
    department: 'Sales',
  },
  {
    id: '3',
    name: 'Pierre Martin',
    email: 'p.martin@elec-plus.fr',
    role: 'Provider',
    status: 'active',
    lastLogin: '5 hours ago',
    createdAt: '2024-06-01',
    providerId: 'PRV-001',
  },
  {
    id: '4',
    name: 'Sophie Dubois',
    email: 'sophie.dubois@ahs.fr',
    role: 'Seller',
    status: 'active',
    lastLogin: '3 hours ago',
    createdAt: '2024-04-15',
    department: 'Sales',
  },
  {
    id: '5',
    name: 'Marc Leroy',
    email: 'm.leroy@chauffage-plus.fr',
    role: 'Provider',
    status: 'pending',
    lastLogin: 'Never',
    createdAt: '2025-11-28',
    providerId: 'PRV-015',
  },
  {
    id: '6',
    name: 'Julie Bernard',
    email: 'julie.bernard@ahs.fr',
    role: 'Operator',
    status: 'inactive',
    lastLogin: '30 days ago',
    createdAt: '2024-02-10',
    department: 'Operations',
  },
];

const roleColors: Record<string, { bg: string; text: string }> = {
  Admin: { bg: 'bg-red-100', text: 'text-red-700' },
  PSM: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Provider: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Seller: { bg: 'bg-green-100', text: 'text-green-700' },
  Operator: { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Offer Manager': { bg: 'bg-pink-100', text: 'text-pink-700' },
};

type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';
type RoleFilter = 'all' | 'Admin' | 'PSM' | 'Provider' | 'Seller' | 'Operator' | 'Offer Manager';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    pending: mockUsers.filter(u => u.status === 'pending').length,
    inactive: mockUsers.filter(u => u.status === 'inactive').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Users</div>
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
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
              <div className="text-sm text-gray-500">Inactive</div>
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
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="PSM">PSM</option>
              <option value="Provider">Provider</option>
              <option value="Seller">Seller</option>
              <option value="Operator">Operator</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="font-medium text-gray-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={clsx(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      roleColors[user.role]?.bg || 'bg-gray-100',
                      roleColors[user.role]?.text || 'text-gray-700',
                    )}>
                      {user.role}
                    </span>
                    {user.department && (
                      <div className="text-xs text-gray-500 mt-1">{user.department}</div>
                    )}
                    {user.providerId && (
                      <div className="text-xs text-gray-500 mt-1">{user.providerId}</div>
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={clsx(
                      'flex items-center gap-1 text-sm',
                      user.status === 'active' && 'text-green-600',
                      user.status === 'pending' && 'text-yellow-600',
                      user.status === 'inactive' && 'text-gray-500',
                    )}>
                      {user.status === 'active' && <CheckCircle className="w-4 h-4" />}
                      {user.status === 'pending' && <Clock className="w-4 h-4" />}
                      {user.status === 'inactive' && <XCircle className="w-4 h-4" />}
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{user.lastLogin}</span>
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{user.createdAt}</span>
                  </td>
                  
                  <td className="px-4 py-4 text-right relative">
                    <button
                      onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {showActions === user.id && (
                      <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit User
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Change Role
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Send Email
                        </button>
                        <hr className="my-1" />
                        {user.status === 'active' ? (
                          <button className="w-full px-4 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Deactivate
                          </button>
                        ) : (
                          <button className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </button>
                        )}
                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {mockUsers.length} users
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="jean.dupont@ahs.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option>Select role...</option>
                  <option>Admin</option>
                  <option>PSM</option>
                  <option>Seller</option>
                  <option>Operator</option>
                  <option>Provider</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
