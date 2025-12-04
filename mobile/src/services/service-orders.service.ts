/**
 * Yellow Grid Mobile - Service Orders API
 * Aligned with platform API v2.1
 */

import { apiService } from './api.service';
import type {
  ServiceOrder,
  ServiceOrderState,
  Urgency,
  TimeWindow,
} from '../types/service-order';

/**
 * Maps API response to mobile app's ServiceOrder type
 * The backend returns data in a different structure than what the mobile app expects
 */
function mapServiceOrder(apiOrder: Record<string, unknown>): ServiceOrder {
  // Build scheduled time slot from start/end times
  let scheduledTimeSlot: TimeWindow | undefined;
  if (apiOrder.scheduledStartTime && apiOrder.scheduledEndTime) {
    scheduledTimeSlot = {
      start: apiOrder.scheduledStartTime as string,
      end: apiOrder.scheduledEndTime as string,
    };
  }

  // Extract customer info
  const customerInfo = apiOrder.customerInfo as Record<string, unknown> | undefined;
  const customerAddress = customerInfo?.address as Record<string, unknown> | undefined;

  // Extract service address
  const serviceAddress = apiOrder.serviceAddress as Record<string, unknown> | undefined;

  // Build full address string
  let fullAddress = '';
  if (serviceAddress) {
    const parts = [
      serviceAddress.streetNumber,
      serviceAddress.street,
      serviceAddress.apartment,
      serviceAddress.postalCode,
      serviceAddress.city,
    ].filter(Boolean);
    fullAddress = parts.join(', ');
  } else if (customerAddress) {
    const parts = [
      customerAddress.street,
      customerAddress.postalCode,
      customerAddress.city,
    ].filter(Boolean);
    fullAddress = parts.join(', ');
  }

  return {
    id: apiOrder.id as string,
    externalId: (apiOrder.externalServiceOrderId as string) || undefined,
    projectId: apiOrder.projectId as string | undefined,
    countryCode: apiOrder.countryCode as string,
    businessUnit: apiOrder.businessUnit as string | undefined,
    buCode: apiOrder.buCode as string | undefined,

    // Map state to status (backend uses 'state', mobile expects 'status')
    status: apiOrder.state as ServiceOrder['status'],
    state: apiOrder.state as ServiceOrder['state'],
    serviceType: apiOrder.serviceType as ServiceOrder['serviceType'],
    urgency: apiOrder.urgency as Urgency,

    // Scheduling
    scheduledDate: apiOrder.scheduledDate as string | undefined,
    scheduledTimeSlot,
    estimatedDuration: apiOrder.estimatedDurationMinutes as number | undefined,

    // Customer info - flatten for easy access
    customerName: customerInfo?.name as string | undefined,
    customerEmail: customerInfo?.email as string | undefined,
    customerPhone: customerInfo?.phone as string | undefined,
    customerAddress: fullAddress || undefined,
    customerInfo: customerInfo ? {
      name: customerInfo.name as string | undefined,
      firstName: customerInfo.firstName as string | undefined,
      lastName: customerInfo.lastName as string | undefined,
      email: customerInfo.email as string | undefined,
      phone: customerInfo.phone as string | undefined,
      preferredContactMethod: customerInfo.preferredContactMethod as 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP' | undefined,
      address: customerAddress ? {
        street: customerAddress.street as string | undefined,
        city: customerAddress.city as string | undefined,
        postalCode: customerAddress.postalCode as string | undefined,
        country: customerAddress.country as string | undefined,
      } : undefined,
    } : undefined,

    // Service address with full details
    serviceAddress: serviceAddress ? {
      street: serviceAddress.street as string,
      streetNumber: serviceAddress.streetNumber as string | undefined,
      apartment: serviceAddress.apartment as string | undefined,
      floor: serviceAddress.floor as string | undefined,
      building: serviceAddress.building as string | undefined,
      city: serviceAddress.city as string,
      state: serviceAddress.state as string | undefined,
      postalCode: serviceAddress.postalCode as string,
      country: serviceAddress.country as string,
      lat: serviceAddress.lat as number | undefined,
      lng: serviceAddress.lng as number | undefined,
      accessInstructions: serviceAddress.accessInstructions as string | undefined,
      accessCode: serviceAddress.accessCode as string | undefined,
      parkingInfo: serviceAddress.parkingInfo as string | undefined,
    } : undefined,

    // Financial info
    totalAmountCustomer: apiOrder.totalAmountCustomer ? Number(apiOrder.totalAmountCustomer) : undefined,
    totalAmountCustomerExclTax: apiOrder.totalAmountCustomerExclTax ? Number(apiOrder.totalAmountCustomerExclTax) : undefined,
    totalTaxCustomer: apiOrder.totalTaxCustomer ? Number(apiOrder.totalTaxCustomer) : undefined,
    totalAmountProvider: apiOrder.totalAmountProvider ? Number(apiOrder.totalAmountProvider) : undefined,
    totalMargin: apiOrder.totalMargin ? Number(apiOrder.totalMargin) : undefined,
    marginPercent: apiOrder.marginPercent ? Number(apiOrder.marginPercent) : undefined,
    currency: apiOrder.currency as string | undefined,

    // Sales context
    salesOrderNumber: apiOrder.salesOrderNumber as string | undefined,
    salesChannel: apiOrder.salesChannel as ServiceOrder['salesChannel'],
    orderDate: apiOrder.orderDate as string | undefined,

    // Extract nested relations
    store: apiOrder.store ? {
      id: (apiOrder.store as Record<string, unknown>).id as string,
      code: (apiOrder.store as Record<string, unknown>).buCode as string,
      name: (apiOrder.store as Record<string, unknown>).name as string,
      buCode: (apiOrder.store as Record<string, unknown>).buCode as string,
    } : undefined,
    salesSystem: apiOrder.salesSystem ? {
      code: (apiOrder.salesSystem as Record<string, unknown>).code as string,
      name: (apiOrder.salesSystem as Record<string, unknown>).name as string,
    } : undefined,

    // Delivery
    productDeliveryStatusEnum: apiOrder.productDeliveryStatus as ServiceOrder['productDeliveryStatusEnum'],
    allProductsDelivered: apiOrder.allProductsDelivered as boolean | undefined,
    earliestDeliveryDate: apiOrder.earliestDeliveryDate as string | undefined,
    latestDeliveryDate: apiOrder.latestDeliveryDate as string | undefined,
    deliveryBlocksExecution: apiOrder.deliveryBlocksExecution as boolean | undefined,

    // Payment
    paymentStatus: apiOrder.paymentStatus as ServiceOrder['paymentStatus'],

    // Risk
    riskLevel: apiOrder.riskLevel as ServiceOrder['riskLevel'],
    riskScore: apiOrder.riskScore as number | undefined,
    salesPotential: apiOrder.salesPotential as ServiceOrder['salesPotential'],

    // Assignment
    assignedProviderId: apiOrder.assignedProviderId as string | undefined,
    assignedProviderName: apiOrder.assignedProvider 
      ? (apiOrder.assignedProvider as Record<string, unknown>).name as string 
      : undefined,
    assignedWorkTeamId: apiOrder.assignedWorkTeamId as string | undefined,

    // Line items count from _count
    lineItems: apiOrder._count 
      ? Array((apiOrder._count as Record<string, number>).lineItems || 0).fill({}) as ServiceOrder['lineItems']
      : undefined,

    // Metadata
    createdAt: apiOrder.createdAt as string,
    updatedAt: apiOrder.updatedAt as string,
  };
}

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

// API response shape from backend (different from mobile types)
interface ApiServiceOrderListResponse {
  data: Record<string, unknown>[];
  total: number;
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

    const response = await apiService.get<ApiServiceOrderListResponse>(
      `/service-orders?${queryParams.toString()}`
    );
    
    // Map API response to mobile app types
    return {
      data: (response.data || []).map(mapServiceOrder),
      total: response.total,
    };
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
    const response = await apiService.get<Record<string, unknown>>(`/service-orders/${id}`);
    return mapServiceOrder(response);
  }

  /**
   * Check in to a service order (start execution)
   */
  async checkIn(orderId: string, data: CheckInData): Promise<ServiceOrder> {
    const response = await apiService.post<Record<string, unknown>>(`/service-orders/${orderId}/check-in`, data);
    return mapServiceOrder(response);
  }

  /**
   * Check out from a service order (complete on-site work)
   */
  async checkOut(orderId: string, data: CheckOutData): Promise<ServiceOrder> {
    const response = await apiService.post<Record<string, unknown>>(`/service-orders/${orderId}/check-out`, data);
    return mapServiceOrder(response);
  }

  /**
   * Update execution progress (checklist, notes, etc.)
   */
  async updateExecution(
    orderId: string,
    data: ExecutionUpdate
  ): Promise<ServiceOrder> {
    const response = await apiService.patch<Record<string, unknown>>(`/service-orders/${orderId}/execution`, data);
    return mapServiceOrder(response);
  }

  /**
   * Submit Work Closing Form
   */
  async submitWCF(orderId: string, data: WCFData): Promise<ServiceOrder> {
    const response = await apiService.post<Record<string, unknown>>(`/service-orders/${orderId}/wcf`, data);
    return mapServiceOrder(response);
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
    const response = await apiService.post<Record<string, unknown>>(`/service-orders/${orderId}/accept`);
    return mapServiceOrder(response);
  }

  /**
   * Decline a service order assignment
   */
  async declineOrder(
    orderId: string,
    reason: string
  ): Promise<ServiceOrder> {
    const response = await apiService.post<Record<string, unknown>>(`/service-orders/${orderId}/decline`, {
      reason,
    });
    return mapServiceOrder(response);
  }

  /**
   * Request date change (negotiation)
   */
  async requestDateChange(
    orderId: string,
    proposedDate: string,
    reason: string
  ): Promise<ServiceOrder> {
    const response = await apiService.post<Record<string, unknown>>(`/service-orders/${orderId}/negotiate-date`, {
      proposedDate,
      reason,
    });
    return mapServiceOrder(response);
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
