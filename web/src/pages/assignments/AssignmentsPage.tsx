/**
 * Assignments List Page
 * View and manage all assignments
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignment-service';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { AssignmentStatus, AssignmentMode } from '@/types';

export default function AssignmentsPage() {
  const [filters, setFilters] = useState({
    status: '',
    mode: '',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => assignmentService.getAll(filters),
  });

  const assignments = data?.data || [];
  const pagination = data?.pagination;

  const getStatusBadge = (status: AssignmentStatus) => {
    const colors: Record<AssignmentStatus, string> = {
      [AssignmentStatus.PENDING]: 'badge-warning',
      [AssignmentStatus.ACCEPTED]: 'badge-success',
      [AssignmentStatus.REFUSED]: 'badge-danger',
      [AssignmentStatus.TIMEOUT]: 'badge-danger',
      [AssignmentStatus.CANCELLED]: 'badge-gray',
    };
    return <span className={clsx('badge', colors[status])}>{status}</span>;
  };

  const getModeBadge = (mode: AssignmentMode) => {
    const colors: Record<AssignmentMode, string> = {
      [AssignmentMode.DIRECT]: 'badge-primary',
      [AssignmentMode.OFFER]: 'badge-info',
      [AssignmentMode.BROADCAST]: 'badge-warning',
    };
    return <span className={clsx('badge', colors[mode])}>{mode}</span>;
  };

  if (error) {
    return (
      <div className="card">
        <p className="text-red-600">Error loading assignments. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">
            {pagination ? `${pagination.total} total assignments` : 'Loading...'}
          </p>
        </div>
        <Link to="/service-orders" className="btn btn-primary">
          + Create Assignment
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by provider, service order..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status filter */}
          <select
            className="input w-48"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            {Object.values(AssignmentStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Mode filter */}
          <select
            className="input w-48"
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value, page: 1 })}
          >
            <option value="">All Modes</option>
            {Object.values(AssignmentMode).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>

          <button className="btn btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No assignments found</div>
        ) : (
          <>
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left">Service Order</th>
                  <th className="px-6 py-3 text-left">Provider</th>
                  <th className="px-6 py-3 text-left">Mode</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Score</th>
                  <th className="px-6 py-3 text-left">Offered At</th>
                  <th className="px-6 py-3 text-left">Response</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="table-row">
                    <td className="table-cell">
                      <Link
                        to={`/service-orders/${assignment.serviceOrderId}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-900"
                      >
                        {assignment.serviceOrder?.externalId || assignment.serviceOrderId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {assignment.provider?.name || 'Unknown Provider'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {assignment.provider?.email}
                      </div>
                    </td>
                    <td className="table-cell">{getModeBadge(assignment.mode)}</td>
                    <td className="table-cell">{getStatusBadge(assignment.status)}</td>
                    <td className="table-cell">
                      {assignment.scoringResult ? (
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.scoringResult.totalScore.toFixed(1)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {assignment.offeredAt
                        ? format(new Date(assignment.offeredAt), 'MMM dd, HH:mm')
                        : '-'}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {assignment.acceptedAt && (
                        <span className="text-green-600">
                          Accepted {format(new Date(assignment.acceptedAt), 'MMM dd, HH:mm')}
                        </span>
                      )}
                      {assignment.refusedAt && (
                        <span className="text-red-600">
                          Refused {format(new Date(assignment.refusedAt), 'MMM dd, HH:mm')}
                        </span>
                      )}
                      {assignment.status === AssignmentStatus.PENDING && '-'}
                    </td>
                    <td className="table-cell">
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page >= pagination.totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
