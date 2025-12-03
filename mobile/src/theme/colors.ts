/**
 * Yellow Grid Mobile App - Color Palette
 * Aligned with the web platform branding
 */

export const colors = {
  // Primary brand colors (matching web tailwind config)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
  },

  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Base colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Background colors
  background: {
    primary: '#f9fafb',   // Main app background
    secondary: '#ffffff', // Cards, modals
    tertiary: '#f3f4f6',  // Subtle sections
  },

  // Text colors
  text: {
    primary: '#111827',   // Main text
    secondary: '#4b5563', // Secondary text
    tertiary: '#9ca3af',  // Muted text
    inverse: '#ffffff',   // Text on dark backgrounds
  },

  // Border colors
  border: {
    default: '#e5e7eb',
    focus: '#2563eb',
    error: '#dc2626',
  },

  // Status colors for service orders
  status: {
    created: '#9ca3af',
    scheduled: '#0ea5e9',
    assigned: '#f59e0b',
    accepted: '#3b82f6',
    inProgress: '#8b5cf6',
    completed: '#22c55e',
    validated: '#059669',
    closed: '#6b7280',
    cancelled: '#ef4444',
  },

  // Urgency colors
  urgency: {
    urgent: '#dc2626',
    standard: '#f59e0b',
    low: '#22c55e',
  },
};

export default colors;
