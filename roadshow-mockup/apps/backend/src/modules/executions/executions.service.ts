import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExecutionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.execution.findMany({
      where,
      include: {
        serviceOrder: true,
        workTeam: {
          include: {
            provider: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.execution.findUnique({
      where: { id },
      include: {
        serviceOrder: true,
        workTeam: {
          include: {
            provider: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.execution.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.execution.update({
      where: { id },
      data,
    });
  }
}
