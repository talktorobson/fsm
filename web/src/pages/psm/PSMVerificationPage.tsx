/**
 * PSM Verification Page
 * 
 * Manage provider document verification and compliance tracking.
 * Enables PSMs to review, approve, or reject provider certifications.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, FileText, CheckCircle, XCircle, Clock, 
  AlertTriangle, Eye, Download, Building, Calendar,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { providerService, CertificationVerificationItem } from '@/services/provider-service';

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

const getStatusColor = (status: VerificationStatus): string => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    case 'expired': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: VerificationStatus) => {
  switch (status) {
    case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
    case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'expired': return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    default: return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

export default function PSMVerificationPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | VerificationStatus>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CertificationVerificationItem | null>(null);

  // Fetch certifications
  const { data: certificationsResponse, isLoading, error } = useQuery({
    queryKey: ['certifications', filterStatus === 'all' ? undefined : filterStatus],
    queryFn: () => providerService.getCertifications({
      status: filterStatus === 'all' ? undefined : filterStatus,
      limit: 100,
    }),
  });

  const certifications = certificationsResponse?.data || [];

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      providerService.verifyCertification(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      setSelectedItem(null);
    },
  });

  // Filter certifications
  const filteredItems = certifications.filter(item => {
    const matchesSearch = 
      item.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.certificateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technician?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technician?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.certificationType === filterType;
    return matchesSearch && matchesType;
  });

  // Get unique certification types for filter
  const certificationTypes = [...new Set(certifications.map(c => c.certificationType))];

  // Compute stats
  const stats = {
    pending: certifications.filter(c => c.status === 'pending').length,
    approved: certifications.filter(c => c.status === 'approved').length,
    rejected: certifications.filter(c => c.status === 'rejected').length,
    expired: certifications.filter(c => c.status === 'expired').length,
  };

  const handleApprove = (id: string) => {
    verifyMutation.mutate({ id, action: 'approve' });
  };

  const handleReject = (id: string) => {
    verifyMutation.mutate({ id, action: 'reject' });
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Certifications</h2>
        <p className="text-gray-600">
          {error instanceof Error ? error.message : 'Failed to load certification data'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certification Verification</h1>
          <p className="text-gray-600">Review and verify provider certifications</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.pending > 0 && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              {stats.pending} pending
            </span>
          )}
          {stats.expired > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {stats.expired} expired
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.expired}</p>
              <p className="text-sm text-gray-600">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers, technicians, or certifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Types</option>
            {certificationTypes.map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading certifications...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Certification List */}
          <div className="col-span-2 card">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Certifications ({filteredItems.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={clsx(
                    'w-full text-left p-4 hover:bg-gray-50 transition-colors',
                    selectedItem?.id === item.id && 'bg-primary-50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.certificateName}</p>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            {item.certificationType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Building className="w-4 h-4" />
                          {item.providerName} - {item.technician?.firstName} {item.technician?.lastName}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Issued: {formatDate(item.issuedAt)}</span>
                          {item.expiresAt && (
                            <>
                              <span>•</span>
                              <span className={item.status === 'expired' ? 'text-red-500' : ''}>
                                Expires: {formatDate(item.expiresAt)}
                              </span>
                            </>
                          )}
                          {item.certificateNumber && (
                            <>
                              <span>•</span>
                              <span>#{item.certificateNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium capitalize',
                      getStatusColor(item.status)
                    )}>
                      {item.status}
                    </span>
                  </div>
                </button>
              ))}
              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {certifications.length === 0 
                    ? 'No certifications found in the system'
                    : 'No certifications found matching your criteria'}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="card">
            {selectedItem ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold">Certification Details</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                    <p className="mt-4 font-medium">{selectedItem.certificateName}</p>
                    <p className="text-sm text-gray-500">{selectedItem.certificationType.replace(/_/g, ' ')}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider</span>
                      <span className="font-medium">{selectedItem.providerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Technician</span>
                      <span className="font-medium">
                        {selectedItem.technician?.firstName} {selectedItem.technician?.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium capitalize',
                        getStatusColor(selectedItem.status)
                      )}>
                        {selectedItem.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issued</span>
                      <span>{formatDate(selectedItem.issuedAt)}</span>
                    </div>
                    {selectedItem.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date</span>
                        <span className={selectedItem.status === 'expired' ? 'text-red-500' : ''}>
                          {formatDate(selectedItem.expiresAt)}
                        </span>
                      </div>
                    )}
                    {selectedItem.certificateNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certificate #</span>
                        <span>{selectedItem.certificateNumber}</span>
                      </div>
                    )}
                    {selectedItem.issuingAuthority && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issuing Authority</span>
                        <span>{selectedItem.issuingAuthority}</span>
                      </div>
                    )}
                    {selectedItem.verifiedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified On</span>
                        <span>{formatDate(selectedItem.verifiedAt)}</span>
                      </div>
                    )}
                  </div>

                  {selectedItem.documentUrl && (
                    <div className="flex gap-2">
                      <button className="flex-1 btn btn-secondary flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button className="flex-1 btn btn-secondary flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  )}

                  {selectedItem.status === 'pending' && (
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <button
                        onClick={() => handleApprove(selectedItem.id)}
                        disabled={verifyMutation.isPending}
                        className="w-full btn btn-primary flex items-center justify-center gap-2"
                      >
                        {verifyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve Certification
                      </button>
                      <button
                        onClick={() => handleReject(selectedItem.id)}
                        disabled={verifyMutation.isPending}
                        className="w-full btn btn-secondary text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        {verifyMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Reject Certification
                      </button>
                    </div>
                  )}

                  {selectedItem.status === 'expired' && (
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Certification Expired</span>
                      </div>
                      <p className="text-sm text-amber-600 mt-1">
                        Contact the provider to request an updated certification.
                      </p>
                      <button className="mt-3 btn btn-secondary w-full flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Request Renewal
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Select a certification to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
