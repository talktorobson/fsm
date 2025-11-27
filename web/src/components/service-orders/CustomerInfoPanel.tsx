/**
 * Customer Info Panel
 * Rich customer information display with contact options
 */

import { useState } from 'react';
import clsx from 'clsx';
import {
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  History,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface CustomerAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

interface CustomerHistory {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  firstOrderDate?: string;
  lastOrderDate?: string;
  averageRating?: number;
  totalSpent?: number;
}

interface CustomerContact {
  type: 'CUSTOMER' | 'SITE_CONTACT' | 'BILLING' | 'EMERGENCY';
  name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  whatsapp?: string;
  isPrimary?: boolean;
  availabilityNotes?: string;
}

interface CustomerData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: CustomerAddress;
  preferredContactMethod?: 'PHONE' | 'EMAIL' | 'SMS' | 'WHATSAPP';
  language?: string;
  notes?: string;
  tags?: string[];
  history?: CustomerHistory;
  contacts?: CustomerContact[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';
}

interface CustomerInfoPanelProps {
  customer: CustomerData;
  onContact: (method: string, contact?: CustomerContact) => void;
  onViewHistory: () => void;
  showFullDetails?: boolean;
}

const riskLevelConfig = {
  LOW: { label: 'Standard', color: 'text-gray-600', bg: 'bg-gray-100' },
  MEDIUM: { label: 'Attention', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  HIGH: { label: 'High Priority', color: 'text-red-600', bg: 'bg-red-100' },
  VIP: { label: 'VIP', color: 'text-purple-600', bg: 'bg-purple-100' },
};

export default function CustomerInfoPanel({
  customer,
  onContact,
  onViewHistory,
  showFullDetails = true,
}: CustomerInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeContactIndex, setActiveContactIndex] = useState<number | null>(null);

  const riskConfig = customer.riskLevel 
    ? riskLevelConfig[customer.riskLevel] 
    : riskLevelConfig.LOW;

  const formatAddress = (address?: CustomerAddress) => {
    if (!address) return null;
    const parts = [address.street, address.city, address.postalCode, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              'w-3 h-3',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-blue-600" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {customer.name}
              </h3>
              {customer.riskLevel && (
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  riskConfig.bg,
                  riskConfig.color
                )}>
                  {riskConfig.label}
                </span>
              )}
            </div>
            
            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            {customer.history && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {customer.history.totalOrders} orders
                </span>
                {customer.history.averageRating && (
                  <span className="flex items-center gap-1">
                    {renderStars(customer.history.averageRating)}
                    {customer.history.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-6 py-4 space-y-3">
        {/* Primary Contact Methods */}
        <div className="grid grid-cols-2 gap-2">
          {customer.phone && (
            <button
              onClick={() => onContact('phone')}
              className="flex items-center gap-2 p-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span className="truncate">{customer.phone}</span>
            </button>
          )}
          {customer.email && (
            <button
              onClick={() => onContact('email')}
              className="flex items-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span className="truncate">{customer.email}</span>
            </button>
          )}
          {customer.mobile && (
            <button
              onClick={() => onContact('sms')}
              className="flex items-center gap-2 p-2.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              SMS
            </button>
          )}
          {customer.mobile && (
            <button
              onClick={() => onContact('whatsapp')}
              className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </button>
          )}
        </div>

        {/* Preferred Contact */}
        {customer.preferredContactMethod && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <AlertTriangle className="w-3 h-3" />
            Preferred: {customer.preferredContactMethod}
          </div>
        )}

        {/* Address */}
        {customer.address && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">{formatAddress(customer.address)}</p>
              {customer.address.lat && customer.address.lng && (
                <a
                  href={`https://www.google.com/maps?q=${customer.address.lat},${customer.address.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  View on map
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && showFullDetails && (
        <div className="border-t border-gray-200">
          {/* Additional Contacts */}
          {customer.contacts && customer.contacts.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Contacts</h4>
              <div className="space-y-2">
                {customer.contacts.map((contact, index) => (
                  <div
                    key={index}
                    className={clsx(
                      'p-3 rounded-lg border transition-colors cursor-pointer',
                      activeContactIndex === index
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setActiveContactIndex(activeContactIndex === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded text-xs font-medium',
                          contact.type === 'CUSTOMER' ? 'bg-blue-100 text-blue-700' :
                          contact.type === 'SITE_CONTACT' ? 'bg-green-100 text-green-700' :
                          contact.type === 'BILLING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        )}>
                          {contact.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {activeContactIndex === index && (
                      <div className="mt-3 space-y-2">
                        {contact.phone && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onContact('phone', contact); }}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </button>
                        )}
                        {contact.mobile && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onContact('mobile', contact); }}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.mobile}
                          </button>
                        )}
                        {contact.email && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onContact('email', contact); }}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                          >
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </button>
                        )}
                        {contact.availabilityNotes && (
                          <p className="text-xs text-gray-500 italic flex items-start gap-1">
                            <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {contact.availabilityNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer History */}
          {customer.history && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Order History
                </h4>
                <button
                  onClick={onViewHistory}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{customer.history.completedOrders}</p>
                  <p className="text-xs text-green-700">Completed</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{customer.history.totalOrders}</p>
                  <p className="text-xs text-blue-700">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{customer.history.cancelledOrders}</p>
                  <p className="text-xs text-red-700">Cancelled</p>
                </div>
              </div>
              {customer.history.totalSpent !== undefined && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">
                    €{customer.history.totalSpent.toLocaleString()}
                  </p>
                </div>
              )}
              {customer.history.lastOrderDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Last order: {new Date(customer.history.lastOrderDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
