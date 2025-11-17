import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ServiceOrderState } from '@prisma/client';

export class StatusUpdateDto {
  @ApiProperty({ description: 'Service order ID' })
  @IsUUID()
  serviceOrderId: string;

  @ApiProperty({ description: 'New status', enum: ServiceOrderState })
  @IsEnum(ServiceOrderState)
  newStatus: ServiceOrderState;

  @ApiProperty({ description: 'Notes/reason', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
