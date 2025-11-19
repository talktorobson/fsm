import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingService } from '../booking.service';

class ScheduledOrdersQueryDto {
  startDate: string;
  endDate: string;
  providerId?: string;
  providerIds?: string[];
  countryCode?: string;
}

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('scheduled-orders')
  @ApiOperation({ summary: 'Get scheduled service orders for calendar view' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled orders fetched',
  })
  async getScheduledOrders(@Query() query: ScheduledOrdersQueryDto) {
    // Handle both providerId (legacy/single) and providerIds (multi)
    let providerIds = query.providerIds;
    if (!providerIds && query.providerId) {
      providerIds = [query.providerId];
    } else if (providerIds && !Array.isArray(providerIds)) {
      // If query param is passed as providerIds=123 (single value), nestjs might not parse as array automatically depending on validation pipe
      providerIds = [providerIds];
    }

    return this.bookingService.getScheduledOrders({
      startDate: query.startDate,
      endDate: query.endDate,
      providerIds,
      countryCode: query.countryCode,
    });
  }
}
