/**
 * Assignment Detail Page
 * View assignment details with scoring transparency
 */

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignment-service';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { AssignmentStatus } from '@/types';

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Assignment Not Found</h3>
          <Link to="/operator/assignments" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.ACCEPTED:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case AssignmentStatus.REFUSED:
      case AssignmentStatus.TIMEOUT:
        return <XCircle className="w-6 h-6 text-red-600" />;
      case AssignmentStatus.PENDING:
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/operator/assignments"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Assignments
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={clsx('badge', {
                'badge-success': assignment.status === AssignmentStatus.ACCEPTED,
                'badge-danger': assignment.status === AssignmentStatus.REFUSED || assignment.status === AssignmentStatus.TIMEOUT,
                'badge-warning': assignment.status === AssignmentStatus.PENDING,
                'badge-gray': assignment.status === AssignmentStatus.CANCELLED,
              })}>
                {assignment.status}
              </span>
              <span className="text-sm text-gray-500">
                {assignment.mode} Mode
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {assignment.status === AssignmentStatus.PENDING && (
              <button className="btn btn-danger">Cancel Assignment</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Status */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              {getStatusIcon(assignment.status)}
              <div>
                <h2 className="text-lg font-semibold">Assignment Status</h2>
                <p className="text-sm text-gray-600">
                  Created {format(new Date(assignment.createdAt), 'PPp')}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Service Order</dt>
                <dd className="mt-1">
                  <Link
                    to={`/service-orders/${assignment.serviceOrderId}`}
                    className="text-sm text-primary-600 hover:text-primary-900"
                  >
                    {assignment.serviceOrder?.externalId || assignment.serviceOrderId}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {assignment.provider?.name || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assignment Mode</dt>
                <dd className="mt-1 text-sm text-gray-900">{assignment.mode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Offered At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {assignment.offeredAt ? format(new Date(assignment.offeredAt), 'PPp') : '-'}
                </dd>
              </div>
              {assignment.acceptedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Accepted At</dt>
                  <dd className="mt-1 text-sm text-green-600">
                    {format(new Date(assignment.acceptedAt), 'PPp')}
                  </dd>
                </div>
              )}
              {assignment.refusedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Refused At</dt>
                  <dd className="mt-1 text-sm text-red-600">
                    {format(new Date(assignment.refusedAt), 'PPp')}
                  </dd>
                </div>
              )}
              {assignment.timeoutAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeout At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(assignment.timeoutAt), 'PPp')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Scoring Transparency */}
          {assignment.scoringResult && (
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold">Provider Scoring Breakdown</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Score</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {assignment.scoringResult.totalScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full"
                    style={{ width: `${Math.min(assignment.scoringResult.totalScore, 100)}%` }}
                  />
                </div>
              </div>

              {/* Scoring Factors */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Scoring Factors
                </h3>
                {assignment.scoringResult.factors.map((factor, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{factor.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{factor.rationale}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-gray-900">
                          {factor.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Weight: {(factor.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min(factor.score, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Assignment Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary-600 rounded-full" />
                  <div className="w-0.5 h-full bg-gray-200" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-gray-900">Assignment Created</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(assignment.createdAt), 'PPp')}
                  </p>
                </div>
              </div>

              {assignment.offeredAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900">Offered to Provider</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(assignment.offeredAt), 'PPp')}
                    </p>
                  </div>
                </div>
              )}

              {assignment.acceptedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Provider Accepted</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(assignment.acceptedAt), 'PPp')}
                    </p>
                  </div>
                </div>
              )}

              {assignment.refusedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Provider Refused</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(assignment.refusedAt), 'PPp')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Provider Info */}
          {assignment.provider && (
            <div className="card">
              <h3 className="font-semibold mb-4">Provider Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Name</dt>
                  <dd className="text-sm font-medium text-gray-900">{assignment.provider.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{assignment.provider.email}</dd>
                </div>
                <Link
                  to={`/providers/${assignment.providerId}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View Provider Profile →
                </Link>
              </dl>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/service-orders/${assignment.serviceOrderId}`}
                className="btn btn-secondary w-full text-sm"
              >
                View Service Order
              </Link>
              {assignment.status === AssignmentStatus.PENDING && (
                <button className="btn btn-danger w-full text-sm">Cancel Assignment</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
