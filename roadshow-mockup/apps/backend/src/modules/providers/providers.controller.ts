import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('providers')
@Controller('providers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({ status: 200, description: 'List of providers' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('countryCode') countryCode?: string,
    @Query('buCode') buCode?: string,
    @Query('active') active?: boolean,
  ) {
    return this.providersService.findAll(pagination, { countryCode, buCode, active });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiResponse({ status: 200, description: 'Provider details' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({ status: 201, description: 'Provider created' })
  async create(@Body() data: any) {
    return this.providersService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update provider' })
  @ApiResponse({ status: 200, description: 'Provider updated' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.providersService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete provider' })
  @ApiResponse({ status: 200, description: 'Provider deleted' })
  async remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }
}
