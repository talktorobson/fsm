import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckOutDto {
  @ApiProperty({ description: 'Service order ID' })
  @IsUUID()
  serviceOrderId: string;

  @ApiProperty({ description: 'Technician user ID performing check-out' })
  @IsUUID()
  technicianUserId: string;

  @ApiProperty({ description: 'Check-out timestamp (ISO)' })
  @IsDateString()
  occurredAt: string;

  @ApiProperty({ description: 'Work order duration in minutes (optional override)', required: false })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiProperty({ description: 'Work summary/notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
