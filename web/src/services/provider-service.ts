/**
 * Provider Service
 * API calls for provider management
 * Enhanced with AHS business rules support
 */

import apiClient from './api-client';
import {
  Provider,
  PaginatedResponse,
  ProviderWorkingSchedule,
  InterventionZone,
  ServicePriorityConfig,
  WorkTeam,
  Technician,
  ProviderTypeEnum,
  RiskLevel,
  ZoneType,
  ServicePriorityType,
  WorkTeamStatus,
} from '@/types';

interface ApiResponse<T> {
  data: T;
  meta: any;
}

interface ProviderFilters {
  status?: string;
  countryCode?: string;
  businessUnit?: string;
  serviceType?: string;
  coverageZone?: string;
  providerType?: ProviderTypeEnum;
  riskLevel?: RiskLevel;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateProviderDto {
  externalId?: string;
  countryCode: string;
  businessUnit: string;
  name: string;
  legalName: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status?: string;
  providerType?: ProviderTypeEnum;
  parentProviderId?: string;
  riskLevel?: RiskLevel;
  latitude?: number;
  longitude?: number;
  contractStartDate?: string;
  contractEndDate?: string;
}

interface CreateWorkTeamDto {
  externalId?: string;
  name: string;
  status?: WorkTeamStatus;
  maxDailyJobs: number;
  minTechnicians?: number;
  maxTechnicians?: number;
  skills: string[];
  serviceTypes: string[];
  postalCodes: string[];
  workingDays: string[];
  shifts: Array<{ code: string; startLocal: string; endLocal: string }>;
}

interface CreateTechnicianDto {
  externalId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isTeamLead?: boolean;
}

interface CreateWorkingScheduleDto {
  dayOfWeek: string;
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  breaks?: Array<{ startTime: string; endTime: string }>;
}

interface CreateInterventionZoneDto {
  name: string;
  zoneType: ZoneType;
  postalCodes?: string[];
  polygonCoordinates?: Array<{ lat: number; lng: number }>;
  maxTravelTimeMinutes?: number;
  maxDistanceKm?: number;
  priority?: number;
  isActive?: boolean;
}

interface CreateServicePriorityDto {
  serviceId: string;
  priorityType: ServicePriorityType;
  isActive?: boolean;
  notes?: string;
}

class ProviderService {
  // ============================================================================
  // PROVIDER CRUD
  // ============================================================================

  /**
   * Get all providers with filters
   */
  async getAll(filters: ProviderFilters = {}): Promise<PaginatedResponse<Provider>> {
    // Remove empty filters
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    );

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Provider>>>('/providers', {
      params,
    });
    return response.data.data;
  }

  /**
   * Get provider by ID
   */
  async getById(id: string): Promise<Provider> {
    const response = await apiClient.get<ApiResponse<Provider>>(`/providers/${id}`);
    return response.data.data;
  }

  /**
   * Create provider
   */
  async create(data: CreateProviderDto): Promise<Provider> {
    const response = await apiClient.post<ApiResponse<Provider>>('/providers', data);
    return response.data.data;
  }

  /**
   * Update provider
   */
  async update(id: string, data: Partial<CreateProviderDto>): Promise<Provider> {
    const response = await apiClient.patch<ApiResponse<Provider>>(`/providers/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete provider
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/providers/${id}`);
  }

  // ============================================================================
  // WORK TEAM CRUD
  // ============================================================================

  /**
   * Get all work teams for a provider
   */
  async getWorkTeams(providerId: string): Promise<WorkTeam[]> {
    const response = await apiClient.get<ApiResponse<WorkTeam[]>>(`/providers/${providerId}/work-teams`);
    return response.data.data;
  }

  /**
   * Get work team by ID
   */
  async getWorkTeamById(workTeamId: string): Promise<WorkTeam> {
    const response = await apiClient.get<ApiResponse<WorkTeam>>(`/providers/work-teams/${workTeamId}`);
    return response.data.data;
  }

  /**
   * Create work team
   */
  async createWorkTeam(providerId: string, data: CreateWorkTeamDto): Promise<WorkTeam> {
    const response = await apiClient.post<ApiResponse<WorkTeam>>(`/providers/${providerId}/work-teams`, data);
    return response.data.data;
  }

  /**
   * Update work team
   */
  async updateWorkTeam(workTeamId: string, data: Partial<CreateWorkTeamDto>): Promise<WorkTeam> {
    const response = await apiClient.put<ApiResponse<WorkTeam>>(`/providers/work-teams/${workTeamId}`, data);
    return response.data.data;
  }

  /**
   * Delete work team
   */
  async deleteWorkTeam(workTeamId: string): Promise<void> {
    await apiClient.delete(`/providers/work-teams/${workTeamId}`);
  }

  // ============================================================================
  // TECHNICIAN CRUD
  // ============================================================================

  /**
   * Get all technicians for a work team
   */
  async getTechnicians(workTeamId: string): Promise<Technician[]> {
    const response = await apiClient.get<ApiResponse<Technician[]>>(`/providers/work-teams/${workTeamId}/technicians`);
    return response.data.data;
  }

  /**
   * Get technician by ID
   */
  async getTechnicianById(technicianId: string): Promise<Technician> {
    const response = await apiClient.get<ApiResponse<Technician>>(`/providers/technicians/${technicianId}`);
    return response.data.data;
  }

  /**
   * Create technician
   */
  async createTechnician(workTeamId: string, data: CreateTechnicianDto): Promise<Technician> {
    const response = await apiClient.post<ApiResponse<Technician>>(`/providers/work-teams/${workTeamId}/technicians`, data);
    return response.data.data;
  }

  /**
   * Update technician
   */
  async updateTechnician(technicianId: string, data: Partial<CreateTechnicianDto>): Promise<Technician> {
    const response = await apiClient.put<ApiResponse<Technician>>(`/providers/technicians/${technicianId}`, data);
    return response.data.data;
  }

  /**
   * Delete technician
   */
  async deleteTechnician(technicianId: string): Promise<void> {
    await apiClient.delete(`/providers/technicians/${technicianId}`);
  }

  // ============================================================================
  // PROVIDER WORKING SCHEDULE
  // ============================================================================

  /**
   * Get provider working schedules
   */
  async getWorkingSchedules(providerId: string): Promise<ProviderWorkingSchedule[]> {
    const response = await apiClient.get<ApiResponse<ProviderWorkingSchedule[]>>(`/providers/${providerId}/working-schedules`);
    return response.data.data;
  }

  /**
   * Upsert single working schedule
   */
  async upsertWorkingSchedule(providerId: string, data: CreateWorkingScheduleDto): Promise<ProviderWorkingSchedule> {
    const response = await apiClient.post<ApiResponse<ProviderWorkingSchedule>>(`/providers/${providerId}/working-schedules`, data);
    return response.data.data;
  }

  /**
   * Bulk update working schedules (week configuration)
   */
  async bulkUpdateWorkingSchedules(providerId: string, schedules: CreateWorkingScheduleDto[]): Promise<ProviderWorkingSchedule[]> {
    const response = await apiClient.put<ApiResponse<ProviderWorkingSchedule[]>>(`/providers/${providerId}/working-schedules/bulk`, { schedules });
    return response.data.data;
  }

  // ============================================================================
  // INTERVENTION ZONES
  // ============================================================================

  /**
   * Get provider intervention zones
   */
  async getInterventionZones(providerId: string): Promise<InterventionZone[]> {
    const response = await apiClient.get<ApiResponse<InterventionZone[]>>(`/providers/${providerId}/intervention-zones`);
    return response.data.data;
  }

  /**
   * Create intervention zone
   */
  async createInterventionZone(providerId: string, data: CreateInterventionZoneDto): Promise<InterventionZone> {
    const response = await apiClient.post<ApiResponse<InterventionZone>>(`/providers/${providerId}/intervention-zones`, data);
    return response.data.data;
  }

  /**
   * Update intervention zone
   */
  async updateInterventionZone(zoneId: string, data: Partial<CreateInterventionZoneDto>): Promise<InterventionZone> {
    const response = await apiClient.put<ApiResponse<InterventionZone>>(`/providers/intervention-zones/${zoneId}`, data);
    return response.data.data;
  }

  /**
   * Delete intervention zone
   */
  async deleteInterventionZone(zoneId: string): Promise<void> {
    await apiClient.delete(`/providers/intervention-zones/${zoneId}`);
  }

  // ============================================================================
  // SERVICE PRIORITY CONFIG (P1/P2/Opt-out)
  // ============================================================================

  /**
   * Get provider service priorities
   */
  async getServicePriorities(providerId: string): Promise<ServicePriorityConfig[]> {
    const response = await apiClient.get<ApiResponse<ServicePriorityConfig[]>>(`/providers/${providerId}/service-priorities`);
    return response.data.data;
  }

  /**
   * Upsert single service priority
   */
  async upsertServicePriority(providerId: string, data: CreateServicePriorityDto): Promise<ServicePriorityConfig> {
    const response = await apiClient.post<ApiResponse<ServicePriorityConfig>>(`/providers/${providerId}/service-priorities`, data);
    return response.data.data;
  }

  /**
   * Bulk update service priorities
   */
  async bulkUpdateServicePriorities(providerId: string, priorities: CreateServicePriorityDto[]): Promise<ServicePriorityConfig[]> {
    const response = await apiClient.put<ApiResponse<ServicePriorityConfig[]>>(`/providers/${providerId}/service-priorities/bulk`, { priorities });
    return response.data.data;
  }

  /**
   * Delete service priority config
   */
  async deleteServicePriority(providerId: string, serviceId: string): Promise<void> {
    await apiClient.delete(`/providers/${providerId}/service-priorities/${serviceId}`);
  }

  // ============================================================================
  // WORK TEAM ZONE ASSIGNMENTS
  // ============================================================================

  /**
   * Assign work team to zone
   */
  async assignWorkTeamToZone(workTeamId: string, zoneId: string, overrides?: { maxCapacity?: number; priority?: number }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/providers/work-teams/${workTeamId}/zones/${zoneId}`, overrides || {});
    return response.data.data;
  }

  /**
   * Remove work team from zone
   */
  async removeWorkTeamFromZone(workTeamId: string, zoneId: string): Promise<void> {
    await apiClient.delete(`/providers/work-teams/${workTeamId}/zones/${zoneId}`);
  }

  // ============================================================================
  // CERTIFICATION VERIFICATION (PSM)
  // ============================================================================

  /**
   * Get all technician certifications for verification
   */
  async getCertifications(filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'expired';
    providerId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<CertificationVerificationItem>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
    );
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CertificationVerificationItem>>>('/providers/certifications', { params });
    return response.data.data;
  }

  /**
   * Verify (approve/reject) a certification
   */
  async verifyCertification(certificationId: string, action: 'approve' | 'reject', notes?: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/providers/certifications/${certificationId}/verify`, { action, notes });
    return response.data.data;
  }

  // ============================================================================
  // COVERAGE ANALYSIS (PSM)
  // ============================================================================

  /**
   * Get all intervention zones for coverage analysis
   */
  async getInterventionZonesForCoverage(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<{ data: any[] }>>('/providers/intervention-zones/coverage');
    return response.data.data.data;
  }

  // ============================================================================
  // SEARCH & ASSIGNMENT
  // ============================================================================

  /**
   * Search providers for assignment
   * Returns providers that match criteria for a service order
   */
  async searchForAssignment(serviceOrderId: string, filters: {
    serviceType?: string;
    coverageZone?: string;
    limit?: number;
  }): Promise<Provider[]> {
    const response = await apiClient.get<Provider[]>('/providers/search-for-assignment', {
      params: {
        serviceOrderId,
        ...filters,
      },
    });
    return response.data;
  }
}

// Type for certification verification item
export interface CertificationVerificationItem {
  id: string;
  technicianId: string;
  certificationType: string;
  certificateName: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  issuedAt: string;
  expiresAt?: string;
  documentUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  providerName: string;
  providerId: string;
  technician: {
    id: string;
    firstName: string;
    lastName: string;
    workTeam: {
      id: string;
      name: string;
      provider: {
        id: string;
        name: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export const providerService = new ProviderService();
