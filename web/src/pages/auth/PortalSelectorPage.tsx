/**
 * Portal Selector Page
 * Landing page to choose which portal to access
 */

import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  ShoppingCart, 
  Settings, 
  Briefcase, 
  Wrench,
  UserCheck,
  LayoutDashboard,
  ExternalLink,
  Smartphone
} from 'lucide-react';

interface PortalCard {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  url: string;
  badge?: string;
}

const portals: PortalCard[] = [
  {
    id: 'operator',
    name: 'Control Tower',
    subtitle: 'Service Operator',
    description: 'Manage service orders, assignments, and field operations',
    icon: <LayoutDashboard className="w-8 h-8" />,
    gradient: 'from-blue-600 to-blue-800',
    url: '/login/operator',
  },
  {
    id: 'provider',
    name: 'Provider Portal',
    subtitle: 'Provider Manager',
    description: 'Manage jobs, teams, and business performance',
    icon: <Building2 className="w-8 h-8" />,
    gradient: 'from-emerald-600 to-emerald-800',
    url: '/login/provider',
  },
  {
    id: 'psm',
    name: 'PSM Portal',
    subtitle: 'Provider Success Manager',
    description: 'Recruit, onboard, and manage provider partners',
    icon: <UserCheck className="w-8 h-8" />,
    gradient: 'from-purple-600 to-purple-800',
    url: '/login/psm',
  },
  {
    id: 'seller',
    name: 'Seller Portal',
    subtitle: 'Retail Sales Staff',
    description: 'Check availability, create quotes, manage projects',
    icon: <ShoppingCart className="w-8 h-8" />,
    gradient: 'from-orange-500 to-orange-700',
    url: '/login/seller',
  },
  {
    id: 'catalog',
    name: 'Catalog Manager',
    subtitle: 'Offer Manager',
    description: 'Define services, pricing, and checklists',
    icon: <Briefcase className="w-8 h-8" />,
    gradient: 'from-cyan-600 to-cyan-800',
    url: '/login/catalog',
  },
  {
    id: 'admin',
    name: 'Admin Portal',
    subtitle: 'Platform Administrator',
    description: 'System configuration and user management',
    icon: <Settings className="w-8 h-8" />,
    gradient: 'from-slate-700 to-slate-900',
    url: '/login/admin',
  },
  {
    id: 'technician',
    name: 'Technician Portal',
    subtitle: 'Field Technician',
    description: 'View schedule, execute jobs, submit reports',
    icon: <Wrench className="w-8 h-8" />,
    gradient: 'from-amber-600 to-amber-800',
    url: '/login/technician',
    badge: 'Mobile App Recommended',
  },
];

export default function PortalSelectorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <span className="text-3xl font-bold text-gray-900">Y</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white">Yellow Grid</h1>
            <p className="text-yellow-400 font-medium">Field Service Management</p>
          </div>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select your portal to access the platform. Each portal is tailored to your role and responsibilities.
        </p>
      </header>

      {/* Portal Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <Link
              key={portal.id}
              to={portal.url}
              className="group relative bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
            >
              {/* Badge */}
              {portal.badge && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-amber-900 text-xs font-semibold rounded-full">
                    <Smartphone className="w-3 h-3" />
                    {portal.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {portal.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                {portal.name}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm font-medium text-gray-400 mb-2">{portal.subtitle}</p>
              <p className="text-gray-500 text-sm">{portal.description}</p>

              {/* Hover effect line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${portal.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Link>
          ))}
        </div>

        {/* Customer Portal Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur rounded-xl px-6 py-4 border border-gray-700/50">
            <Users className="w-6 h-6 text-gray-400" />
            <div className="text-left">
              <p className="text-white font-medium">Customer Portal</p>
              <p className="text-gray-500 text-sm">Customers access via personalized links sent by email/SMS</p>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700/50 p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">🔑 Demo Credentials</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-2">Email Pattern:</p>
              <code className="text-green-400 bg-gray-900 px-3 py-1 rounded">{'{role}.{country}@adeo.com'}</code>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Password (all users):</p>
              <code className="text-green-400 bg-gray-900 px-3 py-1 rounded">Admin123!</code>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-500 text-xs text-center">
              Examples: operator.fr@adeo.com, seller.es@adeo.com, admin.it@adeo.com
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Yellow Grid Field Service Management Platform</p>
        <p>© 2025 Adeo Home Services</p>
      </footer>
    </div>
  );
}
