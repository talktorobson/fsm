/**
 * Offer Manager Services Page
 * Manage service catalog
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  Euro,
  Clock,
  Tag,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { catalogService, CatalogService } from '@/services/catalog-service';
import { useAuth } from '@/contexts/AuthContext';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function OfferManagerServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', category: 'Électricité', description: '', basePrice: '' });

  // Get unique categories from services
  const categories = ['All', ...new Set(services.map(s => s.category).filter(Boolean))];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await catalogService.getAll({
          countryCode: user?.countryCode,
          businessUnit: user?.businessUnit,
          limit: 100,
        });
        setServices(response.data || []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user?.countryCode, user?.businessUnit]);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? service.isActive : !service.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.isActive).length,
    inactive: services.filter(s => !s.isActive).length,
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.description || !newService.basePrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const created = await catalogService.create({
        externalCode: `SVC-${Date.now()}`,
        name: newService.name,
        category: newService.category,
        description: newService.description,
        basePrice: Number.parseFloat(newService.basePrice),
        countryCode: user?.countryCode || 'FR',
        businessUnit: user?.businessUnit || 'RETAIL',
        isActive: false,
      });
      setServices(prev => [...prev, created]);
      setNewService({ name: '', category: 'Électricité', description: '', basePrice: '' });
      setShowAddModal(false);
      toast.success(`Service "${created.name}" created successfully`);
    } catch (err) {
      console.error('Failed to create service:', err);
      toast.error('Failed to create service');
    }
  };

  const handleViewService = (service: CatalogService) => {
    navigate(`/catalog/services/${service.id}`);
    setShowActions(null);
  };

  const handleEditService = (service: CatalogService) => {
    navigate(`/catalog/services/${service.id}/edit`);
    setShowActions(null);
  };

  const handleDuplicateService = async (service: CatalogService) => {
    try {
      const duplicate = await catalogService.create({
        externalCode: `SVC-${Date.now()}`,
        name: `${service.name} (Copy)`,
        category: service.category,
        description: service.description,
        basePrice: service.basePrice,
        countryCode: service.countryCode,
        businessUnit: service.businessUnit,
        estimatedDuration: service.estimatedDuration,
        requiredSkills: service.requiredSkills,
        isActive: false,
      });
      setServices(prev => [...prev, duplicate]);
      toast.success('Service duplicated successfully');
    } catch (err) {
      console.error('Failed to duplicate service:', err);
      toast.error('Failed to duplicate service');
    }
    setShowActions(null);
  };

  const handleDeleteService = async (service: CatalogService) => {
    if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        await catalogService.delete(service.id);
        setServices(prev => prev.filter(s => s.id !== service.id));
        toast.success('Service deleted');
      } catch (err) {
        console.error('Failed to delete service:', err);
        toast.error('Failed to delete service');
      }
    }
    setShowActions(null);
  };

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
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
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
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Services</div>
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
              <Edit className="w-5 h-5 text-yellow-600" />
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                {['All', ...new Set(services.map(s => s.category).filter(Boolean))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className={clsx(
              'bg-white rounded-xl shadow-sm border overflow-hidden',
              !service.isActive && 'opacity-60'
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                  )}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === service.id ? null : service.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showActions === service.id && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                      <button 
                        onClick={() => handleViewService(service)}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button 
                        onClick={() => handleEditService(service)}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDuplicateService(service)}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <hr className="my-1" />
                      <button 
                        onClick={() => handleDeleteService(service)}
                        className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mt-3">{service.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description || 'No description'}</p>

              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {service.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Euro className="w-3 h-3" />
                    Base Price
                  </div>
                  <div className="font-semibold text-gray-900">
                    {service.basePrice ? `€${service.basePrice.toLocaleString()}` : '-'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" />
                    Duration
                  </div>
                  <div className="font-semibold text-gray-900">
                    {service.estimatedDuration ? `${service.estimatedDuration} min` : '-'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {service.requiredSkills?.length || 0} skills
                  </span>
                </div>
                <span>{new Date(service.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add New Service
          </button>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Service</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  id="serviceName"
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Electrical Panel Upgrade"
                />
              </div>
              <div>
                <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="serviceCategory"
                  value={newService.category}
                  onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="serviceDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Service description..."
                />
              </div>
              <div>
                <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-1">Base Price (€)</label>
                <input
                  id="servicePrice"
                  type="number"
                  value={newService.basePrice}
                  onChange={(e) => setNewService(prev => ({ ...prev, basePrice: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="1250"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setNewService({ name: '', category: 'Électricité', description: '', basePrice: '' });
                  setShowAddModal(false);
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
