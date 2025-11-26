import { Injectable, NotFoundException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateProviderDto,
  UpdateProviderDto,
  QueryProvidersDto,
  CreateWorkTeamDto,
  UpdateWorkTeamDto,
  CreateTechnicianDto,
  UpdateTechnicianDto,
  CreateProviderWorkingScheduleDto,
  CreateInterventionZoneDto,
  UpdateInterventionZoneDto,
  CreateServicePriorityConfigDto,
  BulkUpsertServicePriorityDto,
} from './dto';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // PROVIDER CRUD
  // ============================================================================

  async createProvider(dto: CreateProviderDto, currentUserId: string) {
    // Check for duplicate external ID
    if (dto.externalId) {
      const existing = await this.prisma.provider.findUnique({
        where: { externalId: dto.externalId },
      });
      if (existing) {
        throw new ConflictException(`Provider with external ID ${dto.externalId} already exists`);
      }
    }

    const provider = await this.prisma.provider.create({
      data: {
        externalId: dto.externalId,
        countryCode: dto.countryCode,
        businessUnit: dto.businessUnit,
        name: dto.name,
        legalName: dto.legalName,
        taxId: dto.taxId,
        email: dto.email,
        phone: dto.phone,
        address: dto.address ? (dto.address as any) : null,
        addressStreet: dto.addressStreet,
        addressCity: dto.addressCity,
        addressPostalCode: dto.addressPostalCode,
        addressRegion: dto.addressRegion,
        addressCountry: dto.addressCountry,
        coordinates: dto.coordinates,
        status: dto.status || 'ACTIVE',
        // New fields from AHS business requirements
        providerType: dto.providerType,
        parentProviderId: dto.parentProviderId,
        riskLevel: dto.riskLevel || 'NONE',
        contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : undefined,
        contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
      },
      include: {
        workTeams: {
          include: {
            technicians: true,
            calendar: true,
            zoneAssignments: {
              include: {
                interventionZone: true,
              },
            },
          },
        },
        workingSchedule: true,
        servicePriorities: {
          include: {
            specialty: true,
          },
        },
        interventionZones: {
          include: {
            workTeamZoneAssignments: true,
          },
        },
        storeAssignments: {
          include: {
            store: true,
          },
        },
        parentProvider: true,
        subProviders: true,
      },
    });

    this.logger.log(`Provider created: ${provider.name} (${provider.id}) by ${currentUserId}`);
    return provider;
  }

  async findAllProviders(query: QueryProvidersDto, currentUserCountry: string, currentUserBU: string) {
    const { page = 1, limit = 20, search, countryCode, businessUnit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      countryCode: countryCode || currentUserCountry,
      businessUnit: businessUnit || currentUserBU,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [providers, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        skip,
        take: limit,
        include: {
          workTeams: {
            include: {
              technicians: true,
              calendar: true,
            },
          },
          workingSchedule: true,
          servicePriorities: {
            include: {
              specialty: true,
            },
          },
          interventionZones: {
            include: {
              workTeamZoneAssignments: true,
            },
          },
          storeAssignments: {
            include: {
              store: true,
            },
          },
          parentProvider: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.provider.count({ where }),
    ]);

    return {
      data: providers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneProvider(id: string, currentUserCountry: string, currentUserBU: string) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
      include: {
        workTeams: {
          include: {
            technicians: {
              include: {
                certifications: true,
              },
            },
            calendar: true,
            zoneAssignments: {
              include: {
                interventionZone: true,
              },
            },
          },
        },
        workingSchedule: true,
        servicePriorities: {
          include: {
            specialty: true,
          },
        },
        interventionZones: {
          include: {
            workTeamZoneAssignments: true,
          },
        },
        storeAssignments: {
          include: {
            store: true,
          },
        },
        parentProvider: {
          select: {
            id: true,
            name: true,
          },
        },
        subProviders: {
          select: {
            id: true,
            name: true,
            providerType: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async updateProvider(
    id: string,
    dto: UpdateProviderDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const existing = await this.prisma.provider.findFirst({
      where: {
        id,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!existing) {
      throw new NotFoundException('Provider not found');
    }

    const provider = await this.prisma.provider.update({
      where: { id },
      data: {
        name: dto.name,
        legalName: dto.legalName,
        taxId: dto.taxId,
        email: dto.email,
        phone: dto.phone,
        address: dto.address !== undefined ? (dto.address as any) : undefined,
        addressStreet: dto.addressStreet,
        addressCity: dto.addressCity,
        addressPostalCode: dto.addressPostalCode,
        addressRegion: dto.addressRegion,
        addressCountry: dto.addressCountry,
        coordinates: dto.coordinates,
        status: dto.status,
        // New fields from AHS business requirements
        providerType: dto.providerType,
        parentProviderId: dto.parentProviderId,
        riskLevel: dto.riskLevel,
        contractStartDate: dto.contractStartDate ? new Date(dto.contractStartDate) : undefined,
        contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
      },
      include: {
        workTeams: {
          include: {
            technicians: true,
            calendar: true,
          },
        },
        workingSchedule: true,
        servicePriorities: {
          include: {
            specialty: true,
          },
        },
        interventionZones: {
          include: {
            workTeamZoneAssignments: true,
          },
        },
        storeAssignments: {
          include: {
            store: true,
          },
        },
        parentProvider: true,
        subProviders: true,
      },
    });

    this.logger.log(`Provider updated: ${provider.name} (${provider.id}) by ${currentUserId}`);
    return provider;
  }

  async removeProvider(id: string, currentUserId: string, currentUserCountry: string, currentUserBU: string) {
    const existing = await this.prisma.provider.findFirst({
      where: {
        id,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
      include: {
        workTeams: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Provider not found');
    }

    // Check if provider has work teams
    if (existing.workTeams.length > 0) {
      throw new ForbiddenException('Cannot delete provider with existing work teams. Delete work teams first.');
    }

    await this.prisma.provider.delete({
      where: { id },
    });

    this.logger.log(`Provider deleted: ${existing.name} (${id}) by ${currentUserId}`);
    return { message: 'Provider successfully deleted' };
  }

  // ============================================================================
  // WORK TEAM CRUD
  // ============================================================================

  async createWorkTeam(
    providerId: string,
    dto: CreateWorkTeamDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    // Verify provider exists and belongs to current tenant
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const workTeam = await this.prisma.workTeam.create({
      data: {
        providerId,
        countryCode: provider.countryCode,
        externalId: dto.externalId,
        name: dto.name,
        status: dto.status || 'ACTIVE',
        maxDailyJobs: dto.maxDailyJobs,
        minTechnicians: dto.minTechnicians || 1,
        maxTechnicians: dto.maxTechnicians,
        skills: dto.skills,
        serviceTypes: dto.serviceTypes,
        postalCodes: dto.postalCodes,
        workingDays: dto.workingDays,
        shifts: dto.shifts ? (dto.shifts as unknown as any) : undefined,
      },
      include: {
        technicians: true,
        provider: true,
        calendar: true,
        zoneAssignments: {
          include: {
            interventionZone: true,
          },
        },
      },
    });

    this.logger.log(`Work team created: ${workTeam.name} (${workTeam.id}) for provider ${providerId} by ${currentUserId}`);
    return workTeam;
  }

  async findAllWorkTeams(providerId: string, currentUserCountry: string, currentUserBU: string) {
    // Verify provider exists and belongs to current tenant
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const workTeams = await this.prisma.workTeam.findMany({
      where: {
        providerId,
      },
      include: {
        technicians: {
          include: {
            certifications: true,
          },
        },
        calendar: true,
        zoneAssignments: {
          include: {
            interventionZone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workTeams;
  }

  async findOneWorkTeam(workTeamId: string, currentUserCountry: string) {
    const workTeam = await this.prisma.workTeam.findFirst({
      where: {
        id: workTeamId,
        countryCode: currentUserCountry,
      },
      include: {
        technicians: {
          include: {
            certifications: true,
          },
        },
        provider: {
          include: {
            workingSchedule: true,
          },
        },
        calendar: {
          include: {
            plannedAbsences: {
              where: {
                endDate: {
                  gte: new Date(),
                },
              },
            },
            dedicatedWorkingDays: {
              where: {
                date: {
                  gte: new Date(),
                },
              },
            },
          },
        },
        zoneAssignments: {
          include: {
            interventionZone: true,
          },
        },
      },
    });

    if (!workTeam) {
      throw new NotFoundException('Work team not found');
    }

    return workTeam;
  }

  async updateWorkTeam(
    workTeamId: string,
    dto: UpdateWorkTeamDto,
    currentUserId: string,
    currentUserCountry: string,
  ) {
    const existing = await this.prisma.workTeam.findFirst({
      where: {
        id: workTeamId,
        countryCode: currentUserCountry,
      },
    });

    if (!existing) {
      throw new NotFoundException('Work team not found');
    }

    const workTeam = await this.prisma.workTeam.update({
      where: { id: workTeamId },
      data: {
        externalId: dto.externalId,
        name: dto.name,
        status: dto.status,
        maxDailyJobs: dto.maxDailyJobs,
        minTechnicians: dto.minTechnicians,
        maxTechnicians: dto.maxTechnicians,
        skills: dto.skills,
        serviceTypes: dto.serviceTypes,
        postalCodes: dto.postalCodes,
        workingDays: dto.workingDays,
        shifts: dto.shifts ? (dto.shifts as unknown as any) : undefined,
      },
      include: {
        technicians: {
          include: {
            certifications: true,
          },
        },
        provider: true,
        calendar: true,
        zoneAssignments: {
          include: {
            interventionZone: true,
          },
        },
      },
    });

    this.logger.log(`Work team updated: ${workTeam.name} (${workTeam.id}) by ${currentUserId}`);
    return workTeam;
  }

  async removeWorkTeam(workTeamId: string, currentUserId: string, currentUserCountry: string) {
    const existing = await this.prisma.workTeam.findFirst({
      where: {
        id: workTeamId,
        countryCode: currentUserCountry,
      },
      include: {
        technicians: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Work team not found');
    }

    // Check if work team has technicians
    if (existing.technicians.length > 0) {
      throw new ForbiddenException('Cannot delete work team with existing technicians. Delete technicians first.');
    }

    await this.prisma.workTeam.delete({
      where: { id: workTeamId },
    });

    this.logger.log(`Work team deleted: ${existing.name} (${workTeamId}) by ${currentUserId}`);
    return { message: 'Work team successfully deleted' };
  }

  // ============================================================================
  // TECHNICIAN CRUD
  // ============================================================================

  async createTechnician(
    workTeamId: string,
    dto: CreateTechnicianDto,
    currentUserId: string,
    currentUserCountry: string,
  ) {
    // Verify work team exists and belongs to current tenant
    const workTeam = await this.prisma.workTeam.findFirst({
      where: {
        id: workTeamId,
        countryCode: currentUserCountry,
      },
    });

    if (!workTeam) {
      throw new NotFoundException('Work team not found');
    }

    const technician = await this.prisma.technician.create({
      data: {
        workTeamId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      },
      include: {
        workTeam: {
          include: {
            provider: true,
          },
        },
      },
    });

    this.logger.log(`Technician created: ${technician.firstName} ${technician.lastName} (${technician.id}) for work team ${workTeamId} by ${currentUserId}`);
    return technician;
  }

  async findAllTechnicians(workTeamId: string, currentUserCountry: string) {
    // Verify work team exists and belongs to current tenant
    const workTeam = await this.prisma.workTeam.findFirst({
      where: {
        id: workTeamId,
        countryCode: currentUserCountry,
      },
    });

    if (!workTeam) {
      throw new NotFoundException('Work team not found');
    }

    const technicians = await this.prisma.technician.findMany({
      where: {
        workTeamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return technicians;
  }

  async findOneTechnician(technicianId: string, currentUserCountry: string) {
    const technician = await this.prisma.technician.findFirst({
      where: {
        id: technicianId,
        workTeam: {
          countryCode: currentUserCountry,
        },
      },
      include: {
        workTeam: {
          include: {
            provider: true,
          },
        },
      },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async updateTechnician(
    technicianId: string,
    dto: UpdateTechnicianDto,
    currentUserId: string,
    currentUserCountry: string,
  ) {
    const existing = await this.prisma.technician.findFirst({
      where: {
        id: technicianId,
        workTeam: {
          countryCode: currentUserCountry,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Technician not found');
    }

    const technician = await this.prisma.technician.update({
      where: { id: technicianId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
      },
      include: {
        workTeam: {
          include: {
            provider: true,
          },
        },
      },
    });

    this.logger.log(`Technician updated: ${technician.firstName} ${technician.lastName} (${technician.id}) by ${currentUserId}`);
    return technician;
  }

  async removeTechnician(technicianId: string, currentUserId: string, currentUserCountry: string) {
    const existing = await this.prisma.technician.findFirst({
      where: {
        id: technicianId,
        workTeam: {
          countryCode: currentUserCountry,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Technician not found');
    }

    await this.prisma.technician.delete({
      where: { id: technicianId },
    });

    this.logger.log(`Technician deleted: ${existing.firstName} ${existing.lastName} (${technicianId}) by ${currentUserId}`);
    return { message: 'Technician successfully deleted' };
  }

  // ============================================================================
  // PROVIDER WORKING SCHEDULE CRUD
  // ============================================================================

  async getProviderWorkingSchedule(providerId: string, currentUserCountry: string, currentUserBU: string) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
      include: {
        workingSchedule: {
          include: {
            calendarConfig: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider.workingSchedule;
  }

  async upsertProviderWorkingSchedule(
    providerId: string,
    dto: CreateProviderWorkingScheduleDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const schedule = await this.prisma.providerWorkingSchedule.upsert({
      where: {
        providerId,
      },
      create: {
        providerId,
        calendarConfigId: dto.calendarConfigId,
        workingDays: dto.workingDays,
        morningShiftEnabled: dto.morningShiftEnabled,
        morningShiftStart: dto.morningShiftStart,
        morningShiftEnd: dto.morningShiftEnd,
        afternoonShiftEnabled: dto.afternoonShiftEnabled,
        afternoonShiftStart: dto.afternoonShiftStart,
        afternoonShiftEnd: dto.afternoonShiftEnd,
        eveningShiftEnabled: dto.eveningShiftEnabled,
        eveningShiftStart: dto.eveningShiftStart,
        eveningShiftEnd: dto.eveningShiftEnd,
        lunchBreakEnabled: dto.lunchBreakEnabled ?? true,
        lunchBreakStart: dto.lunchBreakStart,
        lunchBreakEnd: dto.lunchBreakEnd,
        maxDailyJobsTotal: dto.maxDailyJobsTotal,
        maxWeeklyJobsTotal: dto.maxWeeklyJobsTotal,
        allowCrossDayJobs: dto.allowCrossDayJobs,
        allowCrossShiftJobs: dto.allowCrossShiftJobs,
        timezoneOverride: dto.timezoneOverride,
      },
      update: {
        calendarConfigId: dto.calendarConfigId,
        workingDays: dto.workingDays,
        morningShiftEnabled: dto.morningShiftEnabled,
        morningShiftStart: dto.morningShiftStart,
        morningShiftEnd: dto.morningShiftEnd,
        afternoonShiftEnabled: dto.afternoonShiftEnabled,
        afternoonShiftStart: dto.afternoonShiftStart,
        afternoonShiftEnd: dto.afternoonShiftEnd,
        eveningShiftEnabled: dto.eveningShiftEnabled,
        eveningShiftStart: dto.eveningShiftStart,
        eveningShiftEnd: dto.eveningShiftEnd,
        lunchBreakEnabled: dto.lunchBreakEnabled,
        lunchBreakStart: dto.lunchBreakStart,
        lunchBreakEnd: dto.lunchBreakEnd,
        maxDailyJobsTotal: dto.maxDailyJobsTotal,
        maxWeeklyJobsTotal: dto.maxWeeklyJobsTotal,
        allowCrossDayJobs: dto.allowCrossDayJobs,
        allowCrossShiftJobs: dto.allowCrossShiftJobs,
        timezoneOverride: dto.timezoneOverride,
      },
      include: {
        calendarConfig: true,
      },
    });

    this.logger.log(`Working schedule upserted for provider ${providerId} by ${currentUserId}`);
    return schedule;
  }

  // ============================================================================
  // INTERVENTION ZONE CRUD
  // ============================================================================

  async getProviderInterventionZones(providerId: string, currentUserCountry: string, currentUserBU: string) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.prisma.interventionZone.findMany({
      where: { providerId },
      include: {
        workTeamZoneAssignments: {
          include: {
            workTeam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ zoneType: 'asc' }, { assignmentPriority: 'asc' }],
    });
  }

  async createInterventionZone(
    providerId: string,
    dto: CreateInterventionZoneDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const zone = await this.prisma.interventionZone.create({
      data: {
        providerId,
        name: dto.name,
        zoneCode: dto.zoneCode,
        zoneType: dto.zoneType,
        postalCodes: dto.postalCodes || [],
        postalCodeVectors: dto.postalCodeVectors ? (dto.postalCodeVectors as unknown as any) : undefined,
        boundaryGeoJson: dto.boundaryGeoJson ? (dto.boundaryGeoJson as unknown as any) : undefined,
        maxCommuteMinutes: dto.maxCommuteMinutes ?? 60,
        defaultTravelBuffer: dto.defaultTravelBuffer ?? 30,
        maxDailyJobsInZone: dto.maxDailyJobsInZone,
        assignmentPriority: dto.assignmentPriority ?? 1,
      },
      include: {
        workTeamZoneAssignments: {
          include: {
            workTeam: true,
          },
        },
      },
    });

    this.logger.log(`Intervention zone created: ${zone.name} (${zone.id}) for provider ${providerId} by ${currentUserId}`);
    return zone;
  }

  async updateInterventionZone(
    zoneId: string,
    dto: UpdateInterventionZoneDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const zone = await this.prisma.interventionZone.findFirst({
      where: {
        id: zoneId,
        provider: {
          countryCode: currentUserCountry,
          businessUnit: currentUserBU,
        },
      },
    });

    if (!zone) {
      throw new NotFoundException('Intervention zone not found');
    }

    const updated = await this.prisma.interventionZone.update({
      where: { id: zoneId },
      data: {
        name: dto.name,
        zoneCode: dto.zoneCode,
        zoneType: dto.zoneType,
        postalCodes: dto.postalCodes,
        postalCodeVectors: dto.postalCodeVectors ? (dto.postalCodeVectors as unknown as any) : undefined,
        boundaryGeoJson: dto.boundaryGeoJson ? (dto.boundaryGeoJson as unknown as any) : undefined,
        maxCommuteMinutes: dto.maxCommuteMinutes,
        defaultTravelBuffer: dto.defaultTravelBuffer,
        maxDailyJobsInZone: dto.maxDailyJobsInZone,
        assignmentPriority: dto.assignmentPriority,
      },
      include: {
        workTeamZoneAssignments: {
          include: {
            workTeam: true,
          },
        },
      },
    });

    this.logger.log(`Intervention zone updated: ${updated.name} (${zoneId}) by ${currentUserId}`);
    return updated;
  }

  async deleteInterventionZone(zoneId: string, currentUserId: string, currentUserCountry: string, currentUserBU: string) {
    const zone = await this.prisma.interventionZone.findFirst({
      where: {
        id: zoneId,
        provider: {
          countryCode: currentUserCountry,
          businessUnit: currentUserBU,
        },
      },
      include: {
        workTeamZoneAssignments: true,
      },
    });

    if (!zone) {
      throw new NotFoundException('Intervention zone not found');
    }

    // Delete related work team assignments first
    if (zone.workTeamZoneAssignments.length > 0) {
      await this.prisma.workTeamZoneAssignment.deleteMany({
        where: { interventionZoneId: zoneId },
      });
    }

    await this.prisma.interventionZone.delete({
      where: { id: zoneId },
    });

    this.logger.log(`Intervention zone deleted: ${zone.name} (${zoneId}) by ${currentUserId}`);
    return { message: 'Intervention zone successfully deleted' };
  }

  // ============================================================================
  // SERVICE PRIORITY CONFIG CRUD
  // ============================================================================

  async getProviderServicePriorities(providerId: string, currentUserCountry: string, currentUserBU: string) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.prisma.servicePriorityConfig.findMany({
      where: { providerId },
      include: {
        specialty: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
          },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async upsertServicePriorityConfig(
    providerId: string,
    dto: CreateServicePriorityConfigDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Verify specialty exists
    const specialty = await this.prisma.providerSpecialty.findUnique({
      where: { id: dto.specialtyId },
    });

    if (!specialty) {
      throw new NotFoundException('Provider specialty not found');
    }

    const config = await this.prisma.servicePriorityConfig.upsert({
      where: {
        providerId_specialtyId: {
          providerId,
          specialtyId: dto.specialtyId,
        },
      },
      create: {
        providerId,
        specialtyId: dto.specialtyId,
        priority: dto.priority,
        bundledWithSpecialtyIds: dto.bundledWithSpecialtyIds,
        maxMonthlyVolume: dto.maxMonthlyVolume,
        priceOverridePercent: dto.priceOverridePercent,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
      update: {
        priority: dto.priority,
        bundledWithSpecialtyIds: dto.bundledWithSpecialtyIds,
        maxMonthlyVolume: dto.maxMonthlyVolume,
        priceOverridePercent: dto.priceOverridePercent,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
      include: {
        specialty: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    this.logger.log(`Service priority config upserted for provider ${providerId}, specialty ${dto.specialtyId} by ${currentUserId}`);
    return config;
  }

  async bulkUpsertServicePriorityConfig(
    providerId: string,
    dto: BulkUpsertServicePriorityDto,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        countryCode: currentUserCountry,
        businessUnit: currentUserBU,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const results = await Promise.all(
      dto.priorities.map(priorityConfig =>
        this.prisma.servicePriorityConfig.upsert({
          where: {
            providerId_specialtyId: {
              providerId,
              specialtyId: priorityConfig.specialtyId,
            },
          },
          create: {
            providerId,
            specialtyId: priorityConfig.specialtyId,
            priority: priorityConfig.priority,
            bundledWithSpecialtyIds: priorityConfig.bundledWithSpecialtyIds,
            maxMonthlyVolume: priorityConfig.maxMonthlyVolume,
            priceOverridePercent: priorityConfig.priceOverridePercent,
            validFrom: priorityConfig.validFrom ? new Date(priorityConfig.validFrom) : undefined,
            validUntil: priorityConfig.validUntil ? new Date(priorityConfig.validUntil) : undefined,
          },
          update: {
            priority: priorityConfig.priority,
            bundledWithSpecialtyIds: priorityConfig.bundledWithSpecialtyIds,
            maxMonthlyVolume: priorityConfig.maxMonthlyVolume,
            priceOverridePercent: priorityConfig.priceOverridePercent,
            validFrom: priorityConfig.validFrom ? new Date(priorityConfig.validFrom) : undefined,
            validUntil: priorityConfig.validUntil ? new Date(priorityConfig.validUntil) : undefined,
          },
          include: {
            specialty: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        })
      )
    );

    this.logger.log(`Bulk service priority config upsert for provider ${providerId} by ${currentUserId}`);
    return results;
  }

  async deleteServicePriorityConfig(
    providerId: string,
    specialtyId: string,
    currentUserId: string,
    currentUserCountry: string,
    currentUserBU: string,
  ) {
    const config = await this.prisma.servicePriorityConfig.findFirst({
      where: {
        providerId,
        specialtyId,
        provider: {
          countryCode: currentUserCountry,
          businessUnit: currentUserBU,
        },
      },
    });

    if (!config) {
      throw new NotFoundException('Service priority config not found');
    }

    await this.prisma.servicePriorityConfig.delete({
      where: {
        providerId_specialtyId: {
          providerId,
          specialtyId,
        },
      },
    });

    this.logger.log(`Service priority config deleted for provider ${providerId}, specialty ${specialtyId} by ${currentUserId}`);
    return { message: 'Service priority config successfully deleted' };
  }

  // ============================================================================
  // WORK TEAM ZONE ASSIGNMENT CRUD
  // ============================================================================

  async assignWorkTeamToZone(
    workTeamId: string,
    interventionZoneId: string,
    overrides: { maxDailyJobsOverride?: number; assignmentPriorityOverride?: number; travelBufferOverride?: number } = {},
    currentUserId: string,
    currentUserCountry: string,
  ) {
    const workTeam = await this.prisma.workTeam.findFirst({
      where: {
        id: workTeamId,
        countryCode: currentUserCountry,
      },
    });

    if (!workTeam) {
      throw new NotFoundException('Work team not found');
    }

    const zone = await this.prisma.interventionZone.findUnique({
      where: { id: interventionZoneId },
    });

    if (!zone) {
      throw new NotFoundException('Intervention zone not found');
    }

    const assignment = await this.prisma.workTeamZoneAssignment.upsert({
      where: {
        workTeamId_interventionZoneId: {
          workTeamId,
          interventionZoneId,
        },
      },
      create: {
        workTeamId,
        interventionZoneId,
        maxDailyJobsOverride: overrides.maxDailyJobsOverride,
        assignmentPriorityOverride: overrides.assignmentPriorityOverride,
        travelBufferOverride: overrides.travelBufferOverride,
      },
      update: {
        maxDailyJobsOverride: overrides.maxDailyJobsOverride,
        assignmentPriorityOverride: overrides.assignmentPriorityOverride,
        travelBufferOverride: overrides.travelBufferOverride,
      },
      include: {
        interventionZone: true,
        workTeam: true,
      },
    });

    this.logger.log(`Work team ${workTeamId} assigned to zone ${interventionZoneId} by ${currentUserId}`);
    return assignment;
  }

  async removeWorkTeamFromZone(
    workTeamId: string,
    interventionZoneId: string,
    currentUserId: string,
    currentUserCountry: string,
  ) {
    const assignment = await this.prisma.workTeamZoneAssignment.findFirst({
      where: {
        workTeamId,
        interventionZoneId,
        workTeam: {
          countryCode: currentUserCountry,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Work team zone assignment not found');
    }

    await this.prisma.workTeamZoneAssignment.delete({
      where: {
        workTeamId_interventionZoneId: {
          workTeamId,
          interventionZoneId,
        },
      },
    });

    this.logger.log(`Work team ${workTeamId} removed from zone ${interventionZoneId} by ${currentUserId}`);
    return { message: 'Work team zone assignment successfully deleted' };
  }
}
