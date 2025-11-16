import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assignments' })
  @ApiResponse({ status: 200, description: 'List of assignments' })
  async findAll(@Query('status') status?: string) {
    return this.assignmentsService.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiResponse({ status: 200, description: 'Assignment details with funnel data' })
  async findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create assignment' })
  @ApiResponse({ status: 201, description: 'Assignment created' })
  async create(@Body() data: any) {
    return this.assignmentsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update assignment status' })
  @ApiResponse({ status: 200, description: 'Assignment updated' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.assignmentsService.update(id, data);
  }
}
