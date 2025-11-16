import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Executions')
@Controller('api/v1/executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get execution details' })
  async findOne(@Param('id') id: string) {
    return this.executionsService.findOne(id);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Technician checks in to start job' })
  async checkIn(@Param('id') id: string, @Body() checkInDto: any) {
    return this.executionsService.checkIn(id, checkInDto);
  }

  @Post(':id/check-out')
  @ApiOperation({ summary: 'Technician checks out to complete job' })
  async checkOut(@Param('id') id: string, @Body() checkOutDto: any) {
    return this.executionsService.checkOut(id, checkOutDto);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Upload execution photos' })
  async uploadPhoto(@Param('id') id: string, @Body() photoDto: any) {
    return this.executionsService.uploadPhoto(id, photoDto);
  }

  @Post(':id/rating')
  @ApiOperation({ summary: 'Customer rates the service' })
  async rateService(@Param('id') id: string, @Body() ratingDto: any) {
    return this.executionsService.rateService(id, ratingDto);
  }
}
