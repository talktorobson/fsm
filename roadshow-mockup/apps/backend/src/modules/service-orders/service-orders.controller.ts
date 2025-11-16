import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceOrdersService } from './service-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('service-orders')
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all service orders' })
  @ApiResponse({ status: 200, description: 'List of service orders' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('countryCode') countryCode?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.serviceOrdersService.findAll(pagination, { countryCode, status, priority });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service order by ID' })
  @ApiResponse({ status: 200, description: 'Service order details' })
  async findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service order' })
  @ApiResponse({ status: 201, description: 'Service order created' })
  async create(@Body() data: any) {
    return this.serviceOrdersService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service order' })
  @ApiResponse({ status: 200, description: 'Service order updated' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.serviceOrdersService.update(id, data);
  }
}
