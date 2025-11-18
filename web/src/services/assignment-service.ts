/**
 * Assignment Service
 * API calls for assignment management
 */

import apiClient from './api-client';
import { Assignment, AssignmentMode, PaginatedResponse } from '@/types';

interface AssignmentFilters {
  status?: string;
  mode?: string;
  serviceOrderId?: string;
  providerId?: string;
  page?: number;
  limit?: number;
}

interface CreateAssignmentDto {
  serviceOrderId: string;
  providerId: string;
  mode: AssignmentMode;
}

interface AssignmentWithScoring extends Assignment {
  provider?: {
    id: string;
    name: string;
    email: string;
  };
  serviceOrder?: {
    id: string;
    externalId: string;
  };
}

class AssignmentService {
  /**
   * Get all assignments with filters
   */
  async getAll(filters: AssignmentFilters = {}): Promise<PaginatedResponse<AssignmentWithScoring>> {
    const response = await apiClient.get<PaginatedResponse<AssignmentWithScoring>>('/assignments', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get assignment by ID
   */
  async getById(id: string): Promise<AssignmentWithScoring> {
    const response = await apiClient.get<AssignmentWithScoring>(`/assignments/${id}`);
    return response.data;
  }

  /**
   * Create direct assignment
   */
  async createDirect(data: CreateAssignmentDto): Promise<Assignment> {
    const response = await apiClient.post<Assignment>('/assignments/direct', data);
    return response.data;
  }

  /**
   * Create offer-based assignment
   */
  async createOffer(data: CreateAssignmentDto): Promise<Assignment> {
    const response = await apiClient.post<Assignment>('/assignments/offer', data);
    return response.data;
  }

  /**
   * Create broadcast assignment (multiple providers)
   */
  async createBroadcast(data: {
    serviceOrderId: string;
    providerIds: string[];
  }): Promise<Assignment[]> {
    const response = await apiClient.post<Assignment[]>('/assignments/broadcast', data);
    return response.data;
  }

  /**
   * Cancel assignment
   */
  async cancel(id: string, reason: string): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(`/assignments/${id}/cancel`, { reason });
    return response.data;
  }

  /**
   * Get candidate providers with scoring
   * Returns providers ranked by scoring algorithm
   */
  async getCandidates(serviceOrderId: string): Promise<Array<{
    provider: {
      id: string;
      name: string;
      email: string;
      phone: string;
      status: string;
    };
    scoring: {
      totalScore: number;
      factors: Array<{
        name: string;
        score: number;
        weight: number;
        rationale: string;
      }>;
    };
  }>> {
    const response = await apiClient.get(`/assignments/candidates/${serviceOrderId}`);
    return response.data;
  }

  /**
   * Get assignment statistics
   */
  async getStatistics() {
    const response = await apiClient.get('/assignments/statistics');
    return response.data;
  }
}

export const assignmentService = new AssignmentService();
