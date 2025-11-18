import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DistanceCalculationService } from './distance-calculation.service';

@Module({
  imports: [ConfigModule],
  providers: [DistanceCalculationService],
  exports: [DistanceCalculationService],
})
export class DistanceModule {}
