import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionsService } from './executions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('executions')
@Controller('executions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all executions' })
  @ApiResponse({ status: 200, description: 'List of executions' })
  async findAll(@Query('status') status?: string) {
    return this.executionsService.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get execution by ID' })
  @ApiResponse({ status: 200, description: 'Execution details' })
  async findOne(@Param('id') id: string) {
    return this.executionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create execution (check-in)' })
  @ApiResponse({ status: 201, description: 'Execution created' })
  async create(@Body() data: any) {
    return this.executionsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update execution (check-out, complete)' })
  @ApiResponse({ status: 200, description: 'Execution updated' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.executionsService.update(id, data);
  }
}
