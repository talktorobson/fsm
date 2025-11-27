/**
 * Contact Customer Modal
 * Multi-channel customer contact options
 */

import { useState } from 'react';
import { Phone, Mail, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import ModalContainer from './ModalContainer';
import clsx from 'clsx';

interface CustomerContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  preferredMethod?: 'email' | 'phone' | 'mobile' | 'whatsapp';
}

interface ContactCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerContact;
  serviceOrderRef?: string;
  onContactLogged?: (method: string, notes: string) => Promise<void>;
}

const messageTemplates = [
  {
    id: 'appointment_reminder',
    label: 'Appointment Reminder',
    message: 'Hello {name}, this is a reminder about your upcoming service appointment. Please confirm your availability.',
  },
  {
    id: 'reschedule_request',
    label: 'Reschedule Request',
    message: 'Hello {name}, we need to reschedule your service appointment. Please contact us to arrange a new time.',
  },
  {
    id: 'contract_pending',
    label: 'Contract Pending',
    message: 'Hello {name}, we noticed your service contract is pending signature. Please review and sign at your earliest convenience.',
  },
  {
    id: 'wcf_signature',
    label: 'WCF Signature Needed',
    message: 'Hello {name}, the work has been completed. Please sign the completion form to finalize the service.',
  },
];

export default function ContactCustomerModal({
  isOpen,
  onClose,
  customer,
  serviceOrderRef,
  onContactLogged,
}: ContactCustomerModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    const template = messageTemplates.find(t => t.id === selectedTemplate);
    return template?.message.replace('{name}', customer.name) || '';
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
    onContactLogged?.('phone', getMessage());
  };

  const handleWhatsApp = (number: string) => {
    const message = encodeURIComponent(getMessage());
    const cleanNumber = number.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    onContactLogged?.('whatsapp', getMessage());
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Regarding Service Order ${serviceOrderRef || ''}`);
    const body = encodeURIComponent(getMessage());
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`, '_blank');
    onContactLogged?.('email', getMessage());
  };

  const handleSMS = (number: string) => {
    const message = encodeURIComponent(getMessage());
    window.open(`sms:${number}?body=${message}`, '_self');
    onContactLogged?.('sms', getMessage());
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Customer"
      subtitle={customer.name}
      size="md"
    >
      {/* Contact Methods */}
      <div className="space-y-3 mb-6">
        {/* Phone */}
        {customer.phone && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(customer.phone!, 'phone')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copiedField === 'phone' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleCall(customer.phone!)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Call
              </button>
            </div>
          </div>
        )}

        {/* Mobile */}
        {customer.mobile && customer.mobile !== customer.phone && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium text-gray-900">{customer.mobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSMS(customer.mobile!)}
                className="px-3 py-2 text-gray-700 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                SMS
              </button>
              <button
                onClick={() => handleCall(customer.mobile!)}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                Call
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp */}
        {customer.whatsapp && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="font-medium text-gray-900">{customer.whatsapp}</p>
              </div>
            </div>
            <button
              onClick={() => handleWhatsApp(customer.whatsapp!)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open WhatsApp
            </button>
          </div>
        )}

        {/* Email */}
        {customer.email && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 truncate max-w-[200px]">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(customer.email!, 'email')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copiedField === 'email' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleEmail}
                className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
              >
                Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Templates */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Message Templates</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {messageTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id);
                setCustomMessage('');
              }}
              className={clsx(
                'px-3 py-2 text-sm rounded-lg border-2 text-left transition-all',
                selectedTemplate === template.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              )}
            >
              {template.label}
            </button>
          ))}
        </div>

        {/* Message Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Preview
          </label>
          <textarea
            value={getMessage()}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={4}
            placeholder="Select a template or type a custom message..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none text-sm"
          />
        </div>
      </div>
    </ModalContainer>
  );
}
