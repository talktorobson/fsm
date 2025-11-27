/**
 * Provider Financial Page
 * Financial dashboard for providers - invoices, payments, WCF
 */

import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  FileText,
  Download,
  Search,
  Euro,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import clsx from 'clsx';

type TabType = 'overview' | 'invoices' | 'wcf' | 'payments';
type InvoiceStatus = 'pending' | 'validated' | 'paid' | 'disputed';
type WCFStatus = 'draft' | 'submitted' | 'validated' | 'rejected';

const mockFinancialData = {
  summary: {
    totalRevenue: 45680,
    pendingPayments: 8450,
    thisMonthRevenue: 12450,
    lastMonthRevenue: 11200,
    pendingWCF: 3,
    averagePaymentTime: 14,
  },
  invoices: [
    { id: 'INV-2024-001', serviceOrderId: 'SO-2024-001', customer: 'Jean Dupont', service: 'Installation électrique', amount: 450, date: '2025-11-25', dueDate: '2025-12-25', status: 'pending' as InvoiceStatus },
    { id: 'INV-2024-002', serviceOrderId: 'SO-2024-003', customer: 'Pierre Bernard', service: 'Mise aux normes', amount: 890, date: '2025-11-20', dueDate: '2025-12-20', status: 'validated' as InvoiceStatus },
    { id: 'INV-2024-003', serviceOrderId: 'SO-2024-004', customer: 'Sophie Petit', service: 'Diagnostic', amount: 80, date: '2025-11-15', dueDate: '2025-12-15', status: 'paid' as InvoiceStatus },
    { id: 'INV-2024-004', serviceOrderId: 'SO-2024-010', customer: 'Marie Martin', service: 'Dépannage', amount: 150, date: '2025-11-10', dueDate: '2025-12-10', status: 'paid' as InvoiceStatus },
  ],
  wcfs: [
    { id: 'WCF-2024-001', serviceOrderId: 'SO-2024-003', customer: 'Pierre Bernard', service: 'Mise aux normes', amount: 890, completionDate: '2025-11-26', status: 'submitted' as WCFStatus },
    { id: 'WCF-2024-002', serviceOrderId: 'SO-2024-005', customer: 'Luc Moreau', service: 'Installation prise', amount: 280, completionDate: '2025-11-24', status: 'draft' as WCFStatus },
    { id: 'WCF-2024-003', serviceOrderId: 'SO-2024-004', customer: 'Sophie Petit', service: 'Diagnostic', amount: 80, completionDate: '2025-11-25', status: 'validated' as WCFStatus },
    { id: 'WCF-2024-004', serviceOrderId: 'SO-2024-008', customer: 'Emma Dubois', service: 'Réparation', amount: 120, completionDate: '2025-11-22', status: 'rejected' as WCFStatus, rejectionReason: 'Photos manquantes' },
  ],
  payments: [
    { id: 'PAY-2024-001', invoiceId: 'INV-2024-003', amount: 80, date: '2025-11-20', method: 'bank_transfer' as const, reference: 'VIR-2024-1234' },
    { id: 'PAY-2024-002', invoiceId: 'INV-2024-004', amount: 150, date: '2025-11-18', method: 'bank_transfer' as const, reference: 'VIR-2024-1189' },
  ],
};

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  validated: { label: 'Validated', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  paid: { label: 'Paid', color: 'text-green-700', bgColor: 'bg-green-100' },
  disputed: { label: 'Disputed', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const wcfStatusConfig: Record<WCFStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  validated: { label: 'Validated', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend,
  color = 'green',
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  trend?: { value: number; positive: boolean };
  color?: 'green' | 'blue' | 'orange' | 'purple';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-medium',
            trend.positive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}

export default function ProviderFinancialPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const data = mockFinancialData;

  const revenueGrowth = ((data.summary.thisMonthRevenue - data.summary.lastMonthRevenue) / data.summary.lastMonthRevenue * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial</h1>
          <p className="text-gray-500 mt-1">Track your earnings, invoices, and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['overview', 'invoices', 'wcf', 'payments'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab === 'wcf' ? 'WCF' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'wcf' && data.summary.pendingWCF > 0 && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                {data.summary.pendingWCF}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Wallet}
              label="Total Revenue"
              value={`€${data.summary.totalRevenue.toLocaleString()}`}
              subValue="Year to date"
              color="green"
            />
            <StatCard
              icon={Euro}
              label="This Month"
              value={`€${data.summary.thisMonthRevenue.toLocaleString()}`}
              trend={{ value: parseFloat(revenueGrowth), positive: parseFloat(revenueGrowth) > 0 }}
              color="blue"
            />
            <StatCard
              icon={Clock}
              label="Pending Payments"
              value={`€${data.summary.pendingPayments.toLocaleString()}`}
              subValue={`${data.invoices.filter(i => i.status === 'pending' || i.status === 'validated').length} invoices`}
              color="orange"
            />
            <StatCard
              icon={FileText}
              label="Pending WCF"
              value={String(data.summary.pendingWCF)}
              subValue="Requires action"
              color="purple"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
                <button onClick={() => setActiveTab('invoices')} className="text-sm text-green-600 hover:text-green-700">
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {data.invoices.slice(0, 3).map(invoice => {
                  const status = invoiceStatusConfig[invoice.status];
                  return (
                    <div key={invoice.id} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{invoice.id}</span>
                          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', status.bgColor, status.color)}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{invoice.customer}</p>
                      </div>
                      <p className="font-semibold text-gray-900">€{invoice.amount}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending WCF */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Work Completion Forms</h2>
                <button onClick={() => setActiveTab('wcf')} className="text-sm text-green-600 hover:text-green-700">
                  View all
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {data.wcfs.filter(w => w.status !== 'validated').slice(0, 3).map(wcf => {
                  const status = wcfStatusConfig[wcf.status];
                  return (
                    <div key={wcf.id} className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{wcf.serviceOrderId}</span>
                            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', status.bgColor, status.color)}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{wcf.customer} • {wcf.service}</p>
                        </div>
                        <p className="font-semibold text-gray-900">€{wcf.amount}</p>
                      </div>
                      {wcf.rejectionReason && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{wcf.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.invoices.map(invoice => {
                const status = invoiceStatusConfig[invoice.status];
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm">{invoice.id}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{invoice.customer}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{invoice.service}</td>
                    <td className="px-5 py-4 font-medium">€{invoice.amount}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{invoice.dueDate}</td>
                    <td className="px-5 py-4">
                      <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', status.bgColor, status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* WCF Tab */}
      {activeTab === 'wcf' && (
        <div className="space-y-4">
          {data.wcfs.map(wcf => {
            const status = wcfStatusConfig[wcf.status];
            return (
              <div key={wcf.id} className={clsx(
                'bg-white rounded-xl border overflow-hidden',
                wcf.status === 'rejected' ? 'border-red-200' : 'border-gray-200'
              )}>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{wcf.id}</span>
                        <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', status.bgColor, status.color)}>
                          {status.label}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mt-1">{wcf.service}</p>
                      <p className="text-sm text-gray-500">{wcf.customer} • Completed {wcf.completionDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">€{wcf.amount}</p>
                    </div>
                  </div>

                  {wcf.rejectionReason && (
                    <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Rejection reason:</p>
                        <p>{wcf.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    {wcf.status === 'draft' && (
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Submit WCF
                      </button>
                    )}
                    {wcf.status === 'rejected' && (
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                        Resubmit
                      </button>
                    )}
                    <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-sm">{payment.id}</td>
                  <td className="px-5 py-4 font-mono text-sm text-gray-600">{payment.invoiceId}</td>
                  <td className="px-5 py-4 font-medium text-green-600">+€{payment.amount}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{payment.date}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      {payment.method === 'bank_transfer' ? 'Bank Transfer' : 'Check'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-gray-500">{payment.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
