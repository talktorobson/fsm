import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { PerformanceQueryDto } from './dto/performance-query.dto';

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary fetched',
  })
  async getDashboardSummary(@Query() query: PerformanceQueryDto) {
    return this.performanceService.getDashboardSummary(query);
  }

  @Get('operators')
  @ApiOperation({ summary: 'Get operator performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Operator performance fetched',
  })
  async getOperatorPerformance(@Query() query: PerformanceQueryDto) {
    return this.performanceService.getOperatorPerformance(query);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get provider performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Provider performance fetched',
  })
  async getProviderPerformance(@Query() query: PerformanceQueryDto) {
    return this.performanceService.getProviderPerformance(query);
  }
}
