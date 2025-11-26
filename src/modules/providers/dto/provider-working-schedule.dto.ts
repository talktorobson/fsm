import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, IsArray, IsUUID } from 'class-validator';

export class CreateProviderWorkingScheduleDto {
  @ApiProperty({
    description: 'Calendar config ID to inherit defaults from',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  calendarConfigId?: string;

  @ApiProperty({
    description: 'Working days array (0=Sunday, 1=Monday, ..., 6=Saturday)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  workingDays?: number[];

  // Morning shift
  @ApiProperty({
    description: 'Enable morning shift',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  morningShiftEnabled?: boolean;

  @ApiProperty({
    description: 'Morning shift start time (HH:mm)',
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  morningShiftStart?: string;

  @ApiProperty({
    description: 'Morning shift end time (HH:mm)',
    example: '14:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  morningShiftEnd?: string;

  // Afternoon shift
  @ApiProperty({
    description: 'Enable afternoon shift',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  afternoonShiftEnabled?: boolean;

  @ApiProperty({
    description: 'Afternoon shift start time (HH:mm)',
    example: '15:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  afternoonShiftStart?: string;

  @ApiProperty({
    description: 'Afternoon shift end time (HH:mm)',
    example: '20:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  afternoonShiftEnd?: string;

  // Evening shift
  @ApiProperty({
    description: 'Enable evening shift',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  eveningShiftEnabled?: boolean;

  @ApiProperty({
    description: 'Evening shift start time (HH:mm)',
    example: '20:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  eveningShiftStart?: string;

  @ApiProperty({
    description: 'Evening shift end time (HH:mm)',
    example: '23:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  eveningShiftEnd?: string;

  // Lunch break
  @ApiProperty({
    description: 'Enable lunch break',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  lunchBreakEnabled?: boolean;

  @ApiProperty({
    description: 'Lunch break start time (HH:mm)',
    example: '13:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  lunchBreakStart?: string;

  @ApiProperty({
    description: 'Lunch break end time (HH:mm)',
    example: '14:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  lunchBreakEnd?: string;

  // Capacity limits
  @ApiProperty({
    description: 'Maximum daily jobs total for provider',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxDailyJobsTotal?: number;

  @ApiProperty({
    description: 'Maximum weekly jobs total for provider',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxWeeklyJobsTotal?: number;

  // Cross-job settings
  @ApiProperty({
    description: 'Allow jobs that span multiple days',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowCrossDayJobs?: boolean;

  @ApiProperty({
    description: 'Allow jobs that span multiple shifts',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowCrossShiftJobs?: boolean;

  @ApiProperty({
    description: 'Timezone override (e.g., "Europe/Madrid")',
    example: 'Europe/Madrid',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezoneOverride?: string;
}

// UpdateProviderWorkingScheduleDto is the same as Create since we're upserting
export class UpdateProviderWorkingScheduleDto extends CreateProviderWorkingScheduleDto {}
