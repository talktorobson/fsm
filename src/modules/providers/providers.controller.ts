import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '@/common/decorators/current-user.decorator';

@ApiTags('providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  // ============================================================================
  // PROVIDER ENDPOINTS
  // ============================================================================

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new provider (Admin only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Provider successfully created' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Provider with external ID already exists' })
  async createProvider(@Body() dto: CreateProviderDto, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.createProvider(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all providers with pagination and filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of providers' })
  async findAllProviders(@Query() query: QueryProvidersDto, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.findAllProviders(query, user.countryCode, user.businessUnit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async findOneProvider(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.findOneProvider(id, user.countryCode, user.businessUnit);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update provider (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider successfully updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async updateProvider(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.updateProvider(id, dto, user.userId, user.countryCode, user.businessUnit);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Partially update provider (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider successfully updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async patchProvider(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.updateProvider(id, dto, user.userId, user.countryCode, user.businessUnit);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete provider (Admin only)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Provider successfully deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Cannot delete provider with work teams' })
  async removeProvider(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.removeProvider(id, user.userId, user.countryCode, user.businessUnit);
  }

  // ============================================================================
  // WORK TEAM ENDPOINTS
  // ============================================================================

  @Post(':providerId/work-teams')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Create work team for provider' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Work team successfully created' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async createWorkTeam(
    @Param('providerId') providerId: string,
    @Body() dto: CreateWorkTeamDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.createWorkTeam(providerId, dto, user.userId, user.countryCode, user.businessUnit);
  }

  @Get(':providerId/work-teams')
  @ApiOperation({ summary: 'Get all work teams for provider' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of work teams' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async findAllWorkTeams(@Param('providerId') providerId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.findAllWorkTeams(providerId, user.countryCode, user.businessUnit);
  }

  @Get('work-teams/:workTeamId')
  @ApiOperation({ summary: 'Get work team by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Work team details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work team not found' })
  async findOneWorkTeam(@Param('workTeamId') workTeamId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.findOneWorkTeam(workTeamId, user.countryCode);
  }

  @Put('work-teams/:workTeamId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Update work team' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Work team successfully updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work team not found' })
  async updateWorkTeam(
    @Param('workTeamId') workTeamId: string,
    @Body() dto: UpdateWorkTeamDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.updateWorkTeam(workTeamId, dto, user.userId, user.countryCode);
  }

  @Delete('work-teams/:workTeamId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete work team' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Work team successfully deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work team not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Cannot delete work team with technicians' })
  async removeWorkTeam(@Param('workTeamId') workTeamId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.removeWorkTeam(workTeamId, user.userId, user.countryCode);
  }

  // ============================================================================
  // TECHNICIAN ENDPOINTS
  // ============================================================================

  @Post('work-teams/:workTeamId/technicians')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Create technician for work team' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Technician successfully created' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work team not found' })
  async createTechnician(
    @Param('workTeamId') workTeamId: string,
    @Body() dto: CreateTechnicianDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.createTechnician(workTeamId, dto, user.userId, user.countryCode);
  }

  @Get('work-teams/:workTeamId/technicians')
  @ApiOperation({ summary: 'Get all technicians for work team' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of technicians' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work team not found' })
  async findAllTechnicians(@Param('workTeamId') workTeamId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.findAllTechnicians(workTeamId, user.countryCode);
  }

  @Get('technicians/:technicianId')
  @ApiOperation({ summary: 'Get technician by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Technician details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Technician not found' })
  async findOneTechnician(@Param('technicianId') technicianId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.findOneTechnician(technicianId, user.countryCode);
  }

  @Put('technicians/:technicianId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Update technician' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Technician successfully updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Technician not found' })
  async updateTechnician(
    @Param('technicianId') technicianId: string,
    @Body() dto: UpdateTechnicianDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.updateTechnician(technicianId, dto, user.userId, user.countryCode);
  }

  @Delete('technicians/:technicianId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete technician' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Technician successfully deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Technician not found' })
  async removeTechnician(@Param('technicianId') technicianId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.removeTechnician(technicianId, user.userId, user.countryCode);
  }

  // ============================================================================
  // PROVIDER WORKING SCHEDULE ENDPOINTS
  // ============================================================================

  @Get(':providerId/working-schedule')
  @ApiOperation({ summary: 'Get provider working schedule (shifts and working days)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider working schedule' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiParam({ name: 'providerId', description: 'Provider ID' })
  async getProviderWorkingSchedule(
    @Param('providerId') providerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.getProviderWorkingSchedule(providerId, user.countryCode, user.businessUnit);
  }

  @Put(':providerId/working-schedule')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Create or update provider working schedule' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Working schedule created/updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async upsertProviderWorkingSchedule(
    @Param('providerId') providerId: string,
    @Body() dto: CreateProviderWorkingScheduleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.upsertProviderWorkingSchedule(
      providerId,
      dto,
      user.userId,
      user.countryCode,
      user.businessUnit,
    );
  }

  // ============================================================================
  // INTERVENTION ZONE ENDPOINTS
  // ============================================================================

  @Get(':providerId/intervention-zones')
  @ApiOperation({ summary: 'Get provider intervention zones' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of intervention zones' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async getProviderInterventionZones(
    @Param('providerId') providerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.getProviderInterventionZones(providerId, user.countryCode, user.businessUnit);
  }

  @Post(':providerId/intervention-zones')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Create intervention zone for provider' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Intervention zone created' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async createInterventionZone(
    @Param('providerId') providerId: string,
    @Body() dto: CreateInterventionZoneDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.createInterventionZone(
      providerId,
      dto,
      user.userId,
      user.countryCode,
      user.businessUnit,
    );
  }

  @Put('intervention-zones/:zoneId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Update intervention zone' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Intervention zone updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Intervention zone not found' })
  async updateInterventionZone(
    @Param('zoneId') zoneId: string,
    @Body() dto: UpdateInterventionZoneDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.updateInterventionZone(
      zoneId,
      dto,
      user.userId,
      user.countryCode,
      user.businessUnit,
    );
  }

  @Delete('intervention-zones/:zoneId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete intervention zone' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Intervention zone deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Intervention zone not found' })
  async deleteInterventionZone(@Param('zoneId') zoneId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.providersService.deleteInterventionZone(zoneId, user.userId, user.countryCode, user.businessUnit);
  }

  // ============================================================================
  // SERVICE PRIORITY CONFIG ENDPOINTS
  // ============================================================================

  @Get(':providerId/service-priorities')
  @ApiOperation({ summary: 'Get provider service priority configurations (P1/P2/Opt-out)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of service priority configs' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async getProviderServicePriorities(
    @Param('providerId') providerId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.getProviderServicePriorities(providerId, user.countryCode, user.businessUnit);
  }

  @Post(':providerId/service-priorities')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Create or update service priority config' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Service priority config created/updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider or service not found' })
  async upsertServicePriorityConfig(
    @Param('providerId') providerId: string,
    @Body() dto: CreateServicePriorityConfigDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.upsertServicePriorityConfig(
      providerId,
      dto,
      user.userId,
      user.countryCode,
      user.businessUnit,
    );
  }

  @Put(':providerId/service-priorities/bulk')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Bulk update service priority configurations' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service priority configs updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  async bulkUpsertServicePriorityConfig(
    @Param('providerId') providerId: string,
    @Body() dto: BulkUpsertServicePriorityDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.bulkUpsertServicePriorityConfig(
      providerId,
      dto,
      user.userId,
      user.countryCode,
      user.businessUnit,
    );
  }

  @Delete(':providerId/service-priorities/:specialtyId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete service priority config' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Service priority config deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service priority config not found' })
  async deleteServicePriorityConfig(
    @Param('providerId') providerId: string,
    @Param('specialtyId') specialtyId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.deleteServicePriorityConfig(
      providerId,
      specialtyId,
      user.userId,
      user.countryCode,
      user.businessUnit,
    );
  }

  // ============================================================================
  // WORK TEAM ZONE ASSIGNMENT ENDPOINTS
  // ============================================================================

  @Post('work-teams/:workTeamId/zones/:interventionZoneId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @ApiOperation({ summary: 'Assign work team to intervention zone' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Work team assigned to zone' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Work team or zone not found' })
  async assignWorkTeamToZone(
    @Param('workTeamId') workTeamId: string,
    @Param('interventionZoneId') interventionZoneId: string,
    @Body() overrides: { maxDailyJobsOverride?: number; assignmentPriorityOverride?: number; travelBufferOverride?: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.assignWorkTeamToZone(
      workTeamId,
      interventionZoneId,
      overrides,
      user.userId,
      user.countryCode,
    );
  }

  @Delete('work-teams/:workTeamId/zones/:interventionZoneId')
  @Roles('ADMIN', 'PROVIDER_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove work team from intervention zone' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Work team removed from zone' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Assignment not found' })
  async removeWorkTeamFromZone(
    @Param('workTeamId') workTeamId: string,
    @Param('interventionZoneId') interventionZoneId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.removeWorkTeamFromZone(workTeamId, interventionZoneId, user.userId, user.countryCode);
  }

  // ============================================================================
  // CERTIFICATION ENDPOINTS (PSM Verification)
  // ============================================================================

  @Get('certifications')
  @ApiOperation({ summary: 'Get all technician certifications for verification (PSM)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of certifications with verification status' })
  async getAllCertifications(
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'expired',
    @Query('providerId') providerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.providersService.getAllCertifications(
      {
        status,
        providerId,
        page: page ? Number.parseInt(page, 10) : undefined,
        limit: limit ? Number.parseInt(limit, 10) : undefined,
      },
      user?.countryCode || '',
      user?.businessUnit || '',
    );
  }

  @Patch('certifications/:certificationId/verify')
  @Roles('ADMIN', 'PROVIDER_MANAGER', 'PSM')
  @ApiOperation({ summary: 'Verify (approve/reject) a certification' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Certification verified' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Certification not found' })
  async verifyCertification(
    @Param('certificationId') certificationId: string,
    @Body() body: { action: 'approve' | 'reject'; notes?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.providersService.verifyCertification(
      certificationId,
      body.action,
      user.userId,
      user.countryCode,
      body.notes,
    );
  }

  // ============================================================================
  // COVERAGE ENDPOINTS (PSM Coverage Analysis)
  // ============================================================================

  @Get('intervention-zones/coverage')
  @ApiOperation({ summary: 'Get all intervention zones for coverage analysis (PSM)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All intervention zones with provider data' })
  async getInterventionZonesForCoverage(@CurrentUser() user: CurrentUserPayload) {
    return this.providersService.getInterventionZonesForCoverage(user.countryCode, user.businessUnit);
  }
}
