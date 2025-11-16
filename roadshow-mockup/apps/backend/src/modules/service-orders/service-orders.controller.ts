import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Service Orders')
@Controller('api/v1/service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List service orders with filters' })
  async findAll(
    @Query('country') country?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.serviceOrdersService.findAll({ country, status, priority });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service order details' })
  async findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new service order' })
  async create(@Body() createServiceOrderDto: any) {
    return this.serviceOrdersService.create(createServiceOrderDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service order' })
  async update(@Param('id') id: string, @Body() updateServiceOrderDto: any) {
    return this.serviceOrdersService.update(id, updateServiceOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service order status' })
  async updateStatus(@Param('id') id: string, @Body() statusDto: { status: string }) {
    return this.serviceOrdersService.updateStatus(id, statusDto.status);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get service order timeline/history' })
  async getTimeline(@Param('id') id: string) {
    return this.serviceOrdersService.getTimeline(id);
  }
}
