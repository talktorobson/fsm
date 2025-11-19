/**
 * Calendar Service
 * API calls for provider availability and scheduling
 */

import apiClient from './api-client';
import { ServiceOrder } from '@/types';

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'busy' | 'blocked';
  bufferBefore?: number;
  bufferAfter?: number;
}

export interface ProviderAvailability {
  providerId: string;
  providerName: string;
  date: string;
  slots: AvailabilitySlot[];
  totalAvailableHours: number;
  utilization: number; // 0-1
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  type: 'service-order' | 'blocked' | 'available';
  data?: ServiceOrder | AvailabilitySlot;
}

export interface SchedulingConflict {
  serviceOrderId: string;
  conflictType: 'overlap' | 'buffer' | 'capacity';
  message: string;
  affectedProviders: string[];
}

class CalendarService {
  /**
   * Get provider availability for a date range
   */
  async getProviderAvailability(params: {
    providerIds?: string[];
    startDate: string;
    endDate: string;
    countryCode?: string;
  }): Promise<ProviderAvailability[]> {
    const response = await apiClient.get<ProviderAvailability[]>('/calendar/availability', {
      params,
    });
    return response.data;
  }

  /**
   * Get scheduled service orders for calendar view
   */
  async getScheduledOrders(params: {
    startDate: string;
    endDate: string;
    providerId?: string;
    providerIds?: string[];
    countryCode?: string;
  }): Promise<ServiceOrder[]> {
    const response = await apiClient.get<ServiceOrder[]>('/calendar/scheduled-orders', {
      params,
    });
    return response.data;
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(
    serviceOrderId: string,
    providerId: string,
    scheduledDate: string
  ): Promise<SchedulingConflict[]> {
    const response = await apiClient.post<SchedulingConflict[]>('/calendar/check-conflicts', {
      serviceOrderId,
      providerId,
      scheduledDate,
    });
    return response.data;
  }

  /**
   * Schedule service order
   */
  async scheduleOrder(
    serviceOrderId: string,
    providerId: string,
    scheduledDate: string
  ): Promise<ServiceOrder> {
    const response = await apiClient.post<ServiceOrder>('/calendar/schedule', {
      serviceOrderId,
      providerId,
      scheduledDate,
    });
    return response.data;
  }

  /**
   * Reschedule service order
   */
  async rescheduleOrder(
    serviceOrderId: string,
    newScheduledDate: string
  ): Promise<ServiceOrder> {
    const response = await apiClient.patch<ServiceOrder>(
      `/calendar/reschedule/${serviceOrderId}`,
      {
        newScheduledDate,
      }
    );
    return response.data;
  }

  /**
   * Block time slot (mark as unavailable)
   */
  async blockTimeSlot(params: {
    providerId: string;
    startTime: string;
    endTime: string;
    reason: string;
  }): Promise<AvailabilitySlot> {
    const response = await apiClient.post<AvailabilitySlot>('/calendar/block-slot', params);
    return response.data;
  }

  /**
   * Get provider utilization metrics
   */
  async getUtilizationMetrics(params: {
    providerIds?: string[];
    startDate: string;
    endDate: string;
  }): Promise<Array<{
    providerId: string;
    providerName: string;
    totalHours: number;
    scheduledHours: number;
    availableHours: number;
    utilizationRate: number;
  }>> {
    const response = await apiClient.get('/calendar/utilization', { params });
    return response.data;
  }
}

export const calendarService = new CalendarService();
