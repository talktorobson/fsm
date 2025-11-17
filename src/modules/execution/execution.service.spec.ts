import { ExecutionService } from './execution.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ServiceOrderState } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  serviceOrder: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  serviceOrderCheckIn: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  serviceOrderCheckOut: {
    create: jest.fn(),
  },
};

describe('ExecutionService', () => {
  let service: ExecutionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExecutionService(mockPrisma as unknown as PrismaService);
    mockPrisma.serviceOrder.findUnique.mockResolvedValue({ id: 'so1', countryCode: 'ES' });
    mockPrisma.serviceOrder.update.mockResolvedValue({});
  });

  it('records check-in and moves SO to IN_PROGRESS', async () => {
    mockPrisma.serviceOrderCheckIn.create.mockResolvedValue({ id: 'ci1' });
    const result = await service.checkIn({
      serviceOrderId: 'so1',
      providerId: 'p1',
      workTeamId: 'w1',
      technicianUserId: 'u1',
      occurredAt: new Date().toISOString(),
      lat: 40.0,
      lng: -3.0,
    });

    expect(result.id).toBe('ci1');
    expect(mockPrisma.serviceOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ state: ServiceOrderState.IN_PROGRESS }) }),
    );
  });

  it('rejects checkout without check-in', async () => {
    mockPrisma.serviceOrderCheckIn.findFirst.mockResolvedValue(null);
    await expect(
      service.checkOut({
        serviceOrderId: 'so1',
        technicianUserId: 'u1',
        occurredAt: new Date().toISOString(),
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
