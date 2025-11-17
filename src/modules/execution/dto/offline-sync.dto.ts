import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class OfflineSyncDto {
  @ApiProperty({
    description: 'Batch of offline operations (create/update check-ins, check-outs, notes, media)',
    type: 'array',
    example: [
      { type: 'check_in', payload: { serviceOrderId: '...', occurredAt: '...' } },
      { type: 'check_out', payload: { serviceOrderId: '...', occurredAt: '...' } },
    ],
  })
  @IsArray()
  ops: Array<Record<string, any>>;

  @ApiProperty({ description: 'Device identifier for audit', required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ description: 'App version/build', required: false })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
