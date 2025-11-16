import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUsersDto {
  @ApiProperty({
    description: 'Filter by country code',
    example: 'FR',
    required: false,
    enum: ['FR', 'ES', 'IT', 'PL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['FR', 'ES', 'IT', 'PL'])
  countryCode?: string;

  @ApiProperty({
    description: 'Filter by business unit',
    example: 'LEROY_MERLIN',
    required: false,
    enum: ['LEROY_MERLIN', 'BRICO_DEPOT'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['LEROY_MERLIN', 'BRICO_DEPOT'])
  businessUnit?: string;

  @ApiProperty({
    description: 'Filter by role name',
    example: 'OPERATOR',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Search by email or name',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Page number (1-indexed)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
