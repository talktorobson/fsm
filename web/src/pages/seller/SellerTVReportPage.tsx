/**
 * Seller TV Report Page
 * Generate Television Visit reports for customer appointments
 */

import { useState } from 'react';
import {
  FileText,
  User,
  Camera,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  Plus,
  Trash2,
  Home,
  Thermometer,
  Zap,
  Droplets,
} from 'lucide-react';
import clsx from 'clsx';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
}

interface Observation {
  id: string;
  category: string;
  description: string;
  photos: string[];
  priority: 'low' | 'medium' | 'high';
}

interface Recommendation {
  id: string;
  service: string;
  description: string;
  estimatedCost: number;
  priority: 'recommended' | 'essential' | 'optional';
}

const observationCategories = [
  { id: 'heating', name: 'Chauffage', icon: Thermometer },
  { id: 'electrical', name: 'Électricité', icon: Zap },
  { id: 'plumbing', name: 'Plomberie', icon: Droplets },
  { id: 'insulation', name: 'Isolation', icon: Home },
  { id: 'general', name: 'Général', icon: Home },
];

export default function SellerTVReportPage() {
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
  });
  const [observations, setObservations] = useState<Observation[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [newObservation, setNewObservation] = useState({
    category: 'heating',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [newRecommendation, setNewRecommendation] = useState({
    service: '',
    description: '',
    estimatedCost: 0,
    priority: 'recommended' as 'recommended' | 'essential' | 'optional',
  });
  const [submitted, setSubmitted] = useState(false);

  const addObservation = () => {
    if (newObservation.description) {
      setObservations([...observations, {
        id: Date.now().toString(),
        ...newObservation,
        photos: [],
      }]);
      setNewObservation({ category: 'heating', description: '', priority: 'medium' });
    }
  };

  const removeObservation = (id: string) => {
    setObservations(observations.filter(o => o.id !== id));
  };

  const addRecommendation = () => {
    if (newRecommendation.service && newRecommendation.description) {
      setRecommendations([...recommendations, {
        id: Date.now().toString(),
        ...newRecommendation,
      }]);
      setNewRecommendation({ service: '', description: '', estimatedCost: 0, priority: 'recommended' });
    }
  };

  const removeRecommendation = (id: string) => {
    setRecommendations(recommendations.filter(r => r.id !== id));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">TV Report Submitted!</h1>
          <p className="text-gray-600 mb-6">
            The report has been saved and sent to the customer.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500">Report Reference</div>
            <div className="font-mono font-semibold text-gray-900">TV-2025-{Date.now().toString().slice(-6)}</div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
              <Download className="w-5 h-5" />
              Download PDF Report
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setCustomerInfo({ name: '', phone: '', email: '', address: '', postalCode: '', city: '' });
                setObservations([]);
                setRecommendations([]);
              }}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Create New Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Customer Info' },
            { num: 2, label: 'Observations' },
            { num: 3, label: 'Recommendations' },
            { num: 4, label: 'Review & Submit' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                  step >= s.num ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className={clsx(
                  'text-sm font-medium',
                  step >= s.num ? 'text-gray-900' : 'text-gray-400'
                )}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div className={clsx(
                  'w-12 h-0.5 mx-4',
                  step > s.num ? 'bg-green-600' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer Info */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Customer Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="jean.dupont@email.fr"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="45 Rue de la République"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={customerInfo.postalCode}
                onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="69001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={customerInfo.city}
                onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Lyon"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Observations
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Observations */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            Site Observations
          </h2>

          {/* Existing Observations */}
          {observations.length > 0 && (
            <div className="space-y-3 mb-6">
              {observations.map(obs => {
                const category = observationCategories.find(c => c.id === obs.category);
                const Icon = category?.icon || Home;
                
                return (
                  <div key={obs.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{category?.name}</span>
                        <span className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          obs.priority === 'high' && 'bg-red-100 text-red-700',
                          obs.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                          obs.priority === 'low' && 'bg-green-100 text-green-700',
                        )}>
                          {obs.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{obs.description}</p>
                    </div>
                    <button
                      onClick={() => removeObservation(obs.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Observation Form */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Add Observation</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  value={newObservation.category}
                  onChange={(e) => setNewObservation({ ...newObservation, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {observationCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select
                  value={newObservation.priority}
                  onChange={(e) => setNewObservation({ ...newObservation, priority: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addObservation}
                  disabled={!newObservation.description}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={newObservation.description}
                onChange={(e) => setNewObservation({ ...newObservation, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={2}
                placeholder="Describe the observation..."
              />
            </div>
            <button className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Camera className="w-4 h-4" />
              Add Photos (optional)
            </button>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue to Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Recommendations */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Service Recommendations
          </h2>

          {/* Existing Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3 mb-6">
              {recommendations.map(rec => (
                <div key={rec.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{rec.service}</span>
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        rec.priority === 'essential' && 'bg-red-100 text-red-700',
                        rec.priority === 'recommended' && 'bg-blue-100 text-blue-700',
                        rec.priority === 'optional' && 'bg-gray-100 text-gray-600',
                      )}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Est. €{rec.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeRecommendation(rec.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Estimated Value</span>
                  <span className="font-semibold text-gray-900">
                    €{recommendations.reduce((s, r) => s + r.estimatedCost, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Add Recommendation Form */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Add Recommendation</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Service</label>
                <input
                  type="text"
                  value={newRecommendation.service}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, service: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Isolation combles"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Est. Cost (€)</label>
                <input
                  type="number"
                  value={newRecommendation.estimatedCost || ''}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, estimatedCost: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select
                  value={newRecommendation.priority}
                  onChange={(e) => setNewRecommendation({ ...newRecommendation, priority: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="essential">Essential</option>
                  <option value="recommended">Recommended</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addRecommendation}
                  disabled={!newRecommendation.service || !newRecommendation.description}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={newRecommendation.description}
                onChange={(e) => setNewRecommendation({ ...newRecommendation, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={2}
                placeholder="Describe the recommended work..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Review Report
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h2>
            
            {/* Customer */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Customer</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{customerInfo.name}</div>
                <div className="text-sm text-gray-600">{customerInfo.address}</div>
                <div className="text-sm text-gray-600">{customerInfo.postalCode} {customerInfo.city}</div>
                <div className="text-sm text-gray-600 mt-2">
                  {customerInfo.phone} • {customerInfo.email}
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                Observations ({observations.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {observations.length > 0 ? observations.map(obs => (
                  <div key={obs.id} className="flex items-center gap-2 text-sm">
                    <span className={clsx(
                      'w-2 h-2 rounded-full',
                      obs.priority === 'high' && 'bg-red-500',
                      obs.priority === 'medium' && 'bg-yellow-500',
                      obs.priority === 'low' && 'bg-green-500',
                    )} />
                    <span className="text-gray-600">{obs.description}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-400">No observations recorded</div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">
                Recommendations ({recommendations.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {recommendations.length > 0 ? recommendations.map(rec => (
                  <div key={rec.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{rec.service}: {rec.description}</span>
                    <span className="font-medium text-gray-900">€{rec.estimatedCost.toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-400">No recommendations added</div>
                )}
                {recommendations.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-green-600">
                      €{recommendations.reduce((s, r) => s + r.estimatedCost, 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
