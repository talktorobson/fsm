/**
 * Yellow Grid Mobile - Service Orders API
 * Aligned with platform API v2.1
 */

import { apiService } from './api.service';
import type {
  ServiceOrder,
  ServiceOrderState,
  Urgency,
} from '../types/service-order';

export interface ServiceOrderListParams {
  page?: number;
  take?: number;
  state?: ServiceOrderState | ServiceOrderState[];
  urgency?: Urgency;
  assignedToMe?: boolean;
  scheduledFrom?: string;
  scheduledTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceOrderListResponse {
  data: ServiceOrder[];
  total: number;
}

export interface ChecklistItemUpdate {
  itemId: string;
  completed: boolean;
  notes?: string;
  photoUrl?: string;
}

export interface ExecutionUpdate {
  checklistItems?: ChecklistItemUpdate[];
  technicianNotes?: string;
  voiceNoteUrl?: string;
}

export interface CheckInData {
  latitude: number;
  longitude: number;
  photoUrl?: string;
  notes?: string;
}

export interface CheckOutData {
  latitude: number;
  longitude: number;
  photoUrl?: string;
  notes?: string;
  workDescription?: string;
  partsUsed?: { partId: string; quantity: number }[];
  timeSpent?: number;
}

export interface WCFData {
  workCompleted: boolean;
  workDescription: string;
  customerSignatureUrl?: string;
  customerFeedback?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  additionalWorkNeeded: boolean;
  additionalWorkDescription?: string;
  partsUsed: { partId: string; quantity: number; description: string }[];
  laborHours: number;
  materialsCost?: number;
  photos: string[];
}

class ServiceOrdersService {
  /**
   * Get paginated list of service orders
   */
  async getServiceOrders(
    params: ServiceOrderListParams = {}
  ): Promise<ServiceOrderListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('skip', String((params.page - 1) * (params.take || 10)));
    if (params.take) queryParams.set('take', String(params.take));
    if (params.state) {
      const states = Array.isArray(params.state) ? params.state : [params.state];
      for (const s of states) {
        queryParams.append('state', s);
      }
    }
    if (params.urgency) queryParams.set('urgency', params.urgency);
    if (params.assignedToMe) queryParams.set('assignedToMe', 'true');
    if (params.scheduledFrom) queryParams.set('scheduledFrom', params.scheduledFrom);
    if (params.scheduledTo) queryParams.set('scheduledTo', params.scheduledTo);
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const response = await apiService.get<ServiceOrderListResponse>(
      `/service-orders?${queryParams.toString()}`
    );
    return response;
  }

  /**
   * Get service orders scheduled for today
   */
  async getTodayOrders(): Promise<ServiceOrder[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getServiceOrders({
      scheduledFrom: `${today}T00:00:00Z`,
      scheduledTo: `${today}T23:59:59Z`,
      assignedToMe: true,
      take: 50,
    });
    return response.data || [];
  }

  /**
   * Get upcoming service orders (next 7 days)
   */
  async getUpcomingOrders(): Promise<ServiceOrder[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const response = await this.getServiceOrders({
      scheduledFrom: today.toISOString(),
      scheduledTo: nextWeek.toISOString(),
      assignedToMe: true,
      take: 50,
      sortBy: 'scheduledDate',
      sortOrder: 'asc',
    });
    return response.data || [];
  }

  /**
   * Get a single service order by ID
   */
  async getServiceOrder(id: string): Promise<ServiceOrder> {
    return apiService.get<ServiceOrder>(`/service-orders/${id}`);
  }

  /**
   * Check in to a service order (start execution)
   */
  async checkIn(orderId: string, data: CheckInData): Promise<ServiceOrder> {
    return apiService.post<ServiceOrder>(`/service-orders/${orderId}/check-in`, data);
  }

  /**
   * Check out from a service order (complete on-site work)
   */
  async checkOut(orderId: string, data: CheckOutData): Promise<ServiceOrder> {
    return apiService.post<ServiceOrder>(`/service-orders/${orderId}/check-out`, data);
  }

  /**
   * Update execution progress (checklist, notes, etc.)
   */
  async updateExecution(
    orderId: string,
    data: ExecutionUpdate
  ): Promise<ServiceOrder> {
    return apiService.patch<ServiceOrder>(`/service-orders/${orderId}/execution`, data);
  }

  /**
   * Submit Work Closing Form
   */
  async submitWCF(orderId: string, data: WCFData): Promise<ServiceOrder> {
    return apiService.post<ServiceOrder>(`/service-orders/${orderId}/wcf`, data);
  }

  /**
   * Upload a photo for a service order
   */
  async uploadPhoto(
    orderId: string,
    photoUri: string,
    type: 'check-in' | 'check-out' | 'checklist' | 'evidence'
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: `${type}-${Date.now()}.jpg`,
    } as unknown as Blob);
    formData.append('type', type);

    return apiService.post<{ url: string }>(
      `/service-orders/${orderId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Upload a voice note
   */
  async uploadVoiceNote(
    orderId: string,
    audioUri: string
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: `voice-note-${Date.now()}.m4a`,
    } as unknown as Blob);

    return apiService.post<{ url: string }>(
      `/service-orders/${orderId}/voice-notes`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Get service order attachments
   */
  async getAttachments(
    orderId: string
  ): Promise<
    { id: string; name: string; url: string; type: string; createdAt: string }[]
  > {
    return apiService.get<
      { id: string; name: string; url: string; type: string; createdAt: string }[]
    >(`/service-orders/${orderId}/attachments`);
  }

  /**
   * Accept a service order assignment
   */
  async acceptOrder(orderId: string): Promise<ServiceOrder> {
    return apiService.post<ServiceOrder>(`/service-orders/${orderId}/accept`);
  }

  /**
   * Decline a service order assignment
   */
  async declineOrder(
    orderId: string,
    reason: string
  ): Promise<ServiceOrder> {
    return apiService.post<ServiceOrder>(`/service-orders/${orderId}/decline`, {
      reason,
    });
  }

  /**
   * Request date change (negotiation)
   */
  async requestDateChange(
    orderId: string,
    proposedDate: string,
    reason: string
  ): Promise<ServiceOrder> {
    return apiService.post<ServiceOrder>(`/service-orders/${orderId}/negotiate-date`, {
      proposedDate,
      reason,
    });
  }

  /**
   * Get daily agenda
   */
  async getAgenda(date: string): Promise<ServiceOrder[]> {
    const response = await this.getServiceOrders({
      scheduledFrom: `${date}T00:00:00Z`,
      scheduledTo: `${date}T23:59:59Z`,
      assignedToMe: true,
      take: 50,
      sortBy: 'scheduledDate',
      sortOrder: 'asc',
    });
    return response.data || [];
  }
}

export const serviceOrdersService = new ServiceOrdersService();
