import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Assignments')
@Controller('api/v1/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('calculate-candidates')
  @ApiOperation({ summary: 'Execute assignment funnel to find eligible providers' })
  async calculateCandidates(@Body() funnelInput: any) {
    return this.assignmentsService.executeFunnel(funnelInput);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create assignment' })
  async create(@Body() createAssignmentDto: any) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment details' })
  async findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Get(':id/funnel')
  @ApiOperation({ summary: 'Get assignment transparency funnel data' })
  async getFunnelTransparency(@Param('id') id: string) {
    return this.assignmentsService.getFunnelTransparency(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get assignment audit logs' })
  async getLogs(@Param('id') id: string) {
    return this.assignmentsService.getLogs(id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Provider accepts assignment' })
  async accept(@Param('id') id: string) {
    return this.assignmentsService.accept(id);
  }

  @Post(':id/refuse')
  @ApiOperation({ summary: 'Provider refuses assignment' })
  async refuse(@Param('id') id: string, @Body() refusalDto: { reason?: string }) {
    return this.assignmentsService.refuse(id, refusalDto.reason);
  }
}
