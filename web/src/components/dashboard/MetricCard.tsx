/**
 * Metric Card Component
 * Green gradient cards for dashboard metrics (Operator Cockpit style)
 */

import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: 'green-1' | 'green-2' | 'green-3' | 'green-4';
  onClick?: () => void;
  loading?: boolean;
}

const variantStyles = {
  'green-1': 'bg-gradient-to-br from-green-500 to-green-600',
  'green-2': 'bg-gradient-to-br from-green-600 to-green-700',
  'green-3': 'bg-gradient-to-br from-green-700 to-green-800',
  'green-4': 'bg-gradient-to-br from-green-800 to-green-900',
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  variant,
  onClick,
  loading = false,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl p-5 text-white transition-all duration-200',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg',
        loading && 'animate-pulse'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6 opacity-80" />
      </div>
      <div className="text-3xl font-bold mb-1">
        {loading ? '—' : value}
      </div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  );
}
