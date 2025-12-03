/**
 * Yellow Grid Mobile - Badge Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[`${size}Size`], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {label}
      </Text>
    </View>
  );
};

// Status badge for service orders
interface StatusBadgeProps {
  status: string;
  size?: BadgeSize;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getVariant = (): BadgeVariant => {
    const statusMap: Record<string, BadgeVariant> = {
      CREATED: 'default',
      SCHEDULED: 'info',
      ASSIGNED: 'warning',
      ACCEPTED: 'primary',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      VALIDATED: 'success',
      CLOSED: 'default',
      CANCELLED: 'danger',
    };
    return statusMap[status] || 'default';
  };

  const formatStatus = (s: string) => {
    if (!s) return 'Unknown';
    return s.replaceAll('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return <Badge label={formatStatus(status)} variant={getVariant()} size={size} />;
};

// Urgency badge
export interface UrgencyBadgeProps {
  urgency: 'URGENT' | 'STANDARD' | 'LOW';
  size?: BadgeSize;
  style?: ViewStyle;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, size = 'md', style }) => {
  const variantMap: Record<string, BadgeVariant> = {
    URGENT: 'danger',
    STANDARD: 'warning',
    LOW: 'success',
  };

  return <Badge label={urgency} variant={variantMap[urgency]} size={size} style={style} />;
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  smSize: {
    paddingVertical: spacing[0.5],
    paddingHorizontal: spacing[2],
  },
  mdSize: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2.5],
  },

  // Variants
  default: {
    backgroundColor: colors.gray[100],
  },
  primary: {
    backgroundColor: colors.primary[100],
  },
  success: {
    backgroundColor: colors.success[100],
  },
  warning: {
    backgroundColor: colors.warning[100],
  },
  danger: {
    backgroundColor: colors.danger[100],
  },
  info: {
    backgroundColor: colors.info[100],
  },

  // Text
  text: {
    fontWeight: '600',
  },
  defaultText: {
    color: colors.gray[700],
  },
  primaryText: {
    color: colors.primary[700],
  },
  successText: {
    color: colors.success[700],
  },
  warningText: {
    color: colors.warning[700],
  },
  dangerText: {
    color: colors.danger[700],
  },
  infoText: {
    color: colors.info[600],
  },

  // Text sizes
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
});

export default Badge;
