import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Providers')
@Controller('api/v1/providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List all providers' })
  async findAll(@Query('country') country?: string) {
    return this.providersService.findAll(country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  async findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new provider' })
  async create(@Body() createProviderDto: any) {
    return this.providersService.create(createProviderDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update provider' })
  async update(@Param('id') id: string, @Body() updateProviderDto: any) {
    return this.providersService.update(id, updateProviderDto);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get provider metrics' })
  async getMetrics(@Param('id') id: string) {
    return this.providersService.getMetrics(id);
  }
}
