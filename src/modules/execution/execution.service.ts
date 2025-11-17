import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { StatusUpdateDto } from './dto/status-update.dto';
import { ServiceOrderState } from '@prisma/client';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkIn(dto: CheckInDto) {
    const prismaAny = this.prisma as any;
    const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: dto.serviceOrderId } });
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    // Basic geofence placeholder: ensure service order postal code matches check-in country/BU (simplified)
    // In production, plug in geofence polygon validation here.

    const record = await prismaAny.serviceOrderCheckIn.create({
      data: {
        serviceOrderId: dto.serviceOrderId,
        providerId: dto.providerId,
        workTeamId: dto.workTeamId,
        technicianUserId: dto.technicianUserId,
        occurredAt: new Date(dto.occurredAt),
        lat: dto.lat,
        lng: dto.lng,
        accuracy: dto.accuracy ?? null,
        notes: dto.notes ?? null,
      },
    });

    // Transition to IN_PROGRESS when check-in happens
    await this.prisma.serviceOrder.update({
      where: { id: dto.serviceOrderId },
      data: {
        state: ServiceOrderState.IN_PROGRESS,
        stateChangedAt: new Date(),
      },
    });

    this.logger.log(`Check-in recorded for service order ${dto.serviceOrderId} by ${dto.technicianUserId}`);
    return record;
  }

  async checkOut(dto: CheckOutDto) {
    const prismaAny = this.prisma as any;
    const checkIn = await prismaAny.serviceOrderCheckIn?.findFirst?.({
      where: { serviceOrderId: dto.serviceOrderId },
      orderBy: { occurredAt: 'desc' },
    });
    if (!checkIn) throw new BadRequestException('No check-in found for this service order');

    const occurredAt = new Date(dto.occurredAt);
    const durationMinutes =
      dto.durationMinutes ??
      Math.max(0, Math.round((occurredAt.getTime() - checkIn.occurredAt.getTime()) / 60000));

    const record = await prismaAny.serviceOrderCheckOut.create({
      data: {
        serviceOrderId: dto.serviceOrderId,
        technicianUserId: dto.technicianUserId,
        occurredAt,
        durationMinutes,
        notes: dto.notes ?? null,
      },
    });

    // Transition to COMPLETED on checkout
    await this.prisma.serviceOrder.update({
      where: { id: dto.serviceOrderId },
      data: {
        state: ServiceOrderState.COMPLETED,
        stateChangedAt: new Date(),
      },
    });

    this.logger.log(`Check-out recorded for service order ${dto.serviceOrderId} by ${dto.technicianUserId}`);
    return record;
  }

  async updateStatus(dto: StatusUpdateDto) {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({ where: { id: dto.serviceOrderId } });
    if (!serviceOrder) throw new NotFoundException('Service order not found');

    // Basic validation: disallow regressions from CLOSED/CANCELLED
    if (serviceOrder.state === ServiceOrderState.CLOSED || serviceOrder.state === ServiceOrderState.CANCELLED) {
      throw new BadRequestException('Service order is terminal');
    }

    const updated = await this.prisma.serviceOrder.update({
      where: { id: dto.serviceOrderId },
      data: {
        state: dto.newStatus,
        stateChangedAt: new Date(),
      },
    });

    this.logger.log(`Service order ${dto.serviceOrderId} status updated to ${dto.newStatus}`);
    return updated;
  }

  async offlineSync(ops: Array<Record<string, any>>) {
    // Placeholder: in production, apply conflict resolution per op type.
    this.logger.log(`Received offline sync batch with ${ops.length} ops`);
    return { processed: ops.length };
  }
}
