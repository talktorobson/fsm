/**
 * Admin Config Page
 * System configuration and settings
 */

import { useState } from 'react';
import {
  Save,
  RefreshCw,
  Globe,
  Bell,
  Shield,
  Database,
  Euro,
  Check,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'text' | 'number' | 'select';
  value: boolean | string | number;
  options?: string[];
}

const configSections: ConfigSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Basic platform configuration',
    icon: Globe,
    settings: [
      { id: 'platformName', label: 'Platform Name', description: 'Display name of the platform', type: 'text', value: 'Yellow Grid' },
      { id: 'defaultLanguage', label: 'Default Language', description: 'Default language for new users', type: 'select', value: 'French', options: ['French', 'English', 'Spanish', 'German'] },
      { id: 'timezone', label: 'Default Timezone', description: 'System default timezone', type: 'select', value: 'Europe/Paris', options: ['Europe/Paris', 'Europe/London', 'UTC'] },
      { id: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put platform in maintenance mode', type: 'toggle', value: false },
    ],
  },
  {
    id: 'notifications',
    title: 'Notification Settings',
    description: 'Configure email and push notifications',
    icon: Bell,
    settings: [
      { id: 'emailNotifications', label: 'Email Notifications', description: 'Send email notifications to users', type: 'toggle', value: true },
      { id: 'smsNotifications', label: 'SMS Notifications', description: 'Send SMS notifications to users', type: 'toggle', value: true },
      { id: 'pushNotifications', label: 'Push Notifications', description: 'Enable push notifications', type: 'toggle', value: true },
      { id: 'dailyDigest', label: 'Daily Digest', description: 'Send daily summary emails', type: 'toggle', value: false },
    ],
  },
  {
    id: 'business',
    title: 'Business Rules',
    description: 'Configure business logic and rules',
    icon: Euro,
    settings: [
      { id: 'defaultCommission', label: 'Default Commission (%)', description: 'Default provider commission rate', type: 'number', value: 10 },
      { id: 'minJobValue', label: 'Minimum Job Value (€)', description: 'Minimum value for service orders', type: 'number', value: 100 },
      { id: 'paymentTerms', label: 'Payment Terms (days)', description: 'Default payment terms for providers', type: 'number', value: 30 },
      { id: 'autoAssignment', label: 'Auto Assignment', description: 'Automatically assign jobs to providers', type: 'toggle', value: true },
    ],
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Configure security and authentication',
    icon: Shield,
    settings: [
      { id: 'twoFactorAuth', label: '2FA Required', description: 'Require two-factor authentication', type: 'toggle', value: false },
      { id: 'sessionTimeout', label: 'Session Timeout (min)', description: 'Auto-logout after inactivity', type: 'number', value: 60 },
      { id: 'passwordExpiry', label: 'Password Expiry (days)', description: 'Force password reset after days', type: 'number', value: 90 },
      { id: 'loginAttempts', label: 'Max Login Attempts', description: 'Lock account after failed attempts', type: 'number', value: 5 },
    ],
  },
];

export default function AdminConfigPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(configSections);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (sectionId: string, settingId: string, value: boolean | string | number) => {
    setSettings(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          settings: section.settings.map(setting => {
            if (setting.id === settingId) {
              return { ...setting, value };
            }
            return setting;
          }),
        };
      }
      return section;
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setHasChanges(false);
    }, 1000);
  };

  const activeConfig = settings.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-500">Manage platform settings and preferences</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {settings.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  activeSection === section.id
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
                <ChevronRight className={clsx(
                  'w-4 h-4',
                  activeSection === section.id ? 'text-green-600' : 'text-gray-400'
                )} />
              </button>
            );
          })}
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = activeConfig.icon;
                return <Icon className="w-6 h-6 text-gray-400" />;
              })()}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{activeConfig.title}</h2>
                <p className="text-sm text-gray-500">{activeConfig.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {activeConfig.settings.map(setting => (
              <div key={setting.id} className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <label className="font-medium text-gray-900">{setting.label}</label>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                
                <div className="flex-shrink-0">
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => handleSettingChange(activeSection, setting.id, !setting.value)}
                      className={clsx(
                        'relative w-12 h-6 rounded-full transition-colors',
                        setting.value ? 'bg-green-600' : 'bg-gray-300'
                      )}
                    >
                      <div className={clsx(
                        'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        setting.value ? 'translate-x-7' : 'translate-x-1'
                      )} />
                    </button>
                  )}
                  
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={setting.value as string}
                      onChange={(e) => handleSettingChange(activeSection, setting.id, e.target.value)}
                      className="w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  )}
                  
                  {setting.type === 'number' && (
                    <input
                      type="number"
                      value={setting.value as number}
                      onChange={(e) => handleSettingChange(activeSection, setting.id, parseInt(e.target.value) || 0)}
                      className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  )}
                  
                  {setting.type === 'select' && (
                    <select
                      value={setting.value as string}
                      onChange={(e) => handleSettingChange(activeSection, setting.id, e.target.value)}
                      className="w-48 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {setting.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />
          System Information
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Version', value: 'v2.0.0' },
            { label: 'Environment', value: 'Production' },
            { label: 'Last Deployment', value: 'Nov 28, 2025 10:30' },
            { label: 'Database', value: 'PostgreSQL 15.2' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="font-medium text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
