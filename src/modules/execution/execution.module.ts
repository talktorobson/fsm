import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';

@Module({
  imports: [PrismaModule],
  providers: [ExecutionService],
  controllers: [ExecutionController],
  exports: [ExecutionService],
})
export class ExecutionModule {}
