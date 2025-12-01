/**
 * Customer Portal Service
 * API calls for customer self-service portal (unauthenticated)
 */

import apiClient from './api-client';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// Types matching backend response
export interface CustomerServiceOrder {
  id: string;
  orderNumber: string;
  serviceName: string;
  serviceType: string;
  state: string;
  stateHistory: Array<{
    state: string;
    timestamp: string;
    actor: string;
  }>;
  scheduledDate: string | null;
  scheduledTimeSlot: string | null;
  serviceAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
  assignedProvider?: {
    name: string;
    phone: string | null;
  };
  assignedWorkTeam?: {
    name: string;
  };
  lineItems: Array<{
    id: string;
    lineType: string;
    name: string;
    quantity: number;
    deliveryStatus: string | null;
    executionStatus: string | null;
  }>;
  contract?: {
    id: string;
    status: string;
    signedAt: string | null;
  };
  wcf?: {
    id: string;
    status: string;
    signedAt: string | null;
  };
}

export interface CustomerData {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface CustomerPortalServiceOrderResponse {
  serviceOrder: CustomerServiceOrder;
  customer: CustomerData;
}

export interface CustomerPortalWCFResponse {
  wcf: {
    id: string;
    status: string;
    signedAt: string | null;
    customerSignature: string | null;
    technicianSignature: string | null;
    workDescription: string | null;
    customerComments: string | null;
  } | null;
  checklistItems: Array<{
    id: string;
    text: string;
    completed: boolean;
    required: boolean;
  }>;
  serviceOrder: {
    id: string;
    serviceName: string;
  };
}

export interface CustomerPortalPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string | null;
  category: string;
  createdAt: string;
}

export interface CustomerPortalPhotosResponse {
  photos: CustomerPortalPhoto[];
}

class CustomerPortalService {
  /**
   * Get service order status by access token
   * The access token is typically the service order ID or external ID
   */
  async getServiceOrder(accessToken: string): Promise<CustomerPortalServiceOrderResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<CustomerPortalServiceOrderResponse>>(
        `/customer-portal/${accessToken}/service-order`
      );
      return response.data.data;
    } catch (error: unknown) {
      // 404 means not found, return null
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Get WCF (Work Completion Form) data for a service order
   */
  async getWCFData(accessToken: string): Promise<CustomerPortalWCFResponse | null> {
    try {
      const response = await apiClient.get<ApiResponse<CustomerPortalWCFResponse>>(
        `/customer-portal/${accessToken}/wcf`
      );
      return response.data.data;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Get photos for a service order
   */
  async getPhotos(accessToken: string): Promise<CustomerPortalPhotosResponse> {
    try {
      const response = await apiClient.get<ApiResponse<CustomerPortalPhotosResponse>>(
        `/customer-portal/${accessToken}/photos`
      );
      return response.data.data;
    } catch {
      // Return empty array on any error
      return { photos: [] };
    }
  }
}

export const customerPortalService = new CustomerPortalService();
