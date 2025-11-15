import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics' })
  async getDashboard(@Query('countryCode') countryCode?: string) {
    return this.analyticsService.getDashboardMetrics(countryCode);
  }

  @Get('providers/:id/metrics')
  @ApiOperation({ summary: 'Get provider performance metrics' })
  @ApiResponse({ status: 200, description: 'Provider metrics' })
  async getProviderMetrics(@Param('id') id: string) {
    return this.analyticsService.getProviderMetrics(id);
  }
}
