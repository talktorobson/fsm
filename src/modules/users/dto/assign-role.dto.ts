import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'Role name to assign',
    example: 'ADMIN',
    enum: ['OPERATOR', 'ADMIN', 'PROVIDER_MANAGER', 'TECHNICIAN'],
  })
  @IsString()
  roleName: string;
}
