import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  async getDashboard(@Query('country') country?: string) {
    return this.analyticsService.getDashboard(country);
  }

  @Get('providers/scorecard')
  @ApiOperation({ summary: 'Get provider scorecards' })
  async getProviderScorecards(@Query('country') country?: string) {
    return this.analyticsService.getProviderScorecards(country);
  }

  @Get('capacity-heatmap')
  @ApiOperation({ summary: 'Get capacity heatmap data' })
  async getCapacityHeatmap(@Query('country') country?: string) {
    return this.analyticsService.getCapacityHeatmap(country);
  }
}
