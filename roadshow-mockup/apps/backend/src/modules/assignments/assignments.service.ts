import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.assignment.findMany({
      where,
      include: {
        serviceOrder: true,
        provider: true,
        workTeam: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        serviceOrder: true,
        provider: {
          include: {
            workTeams: true,
          },
        },
        workTeam: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.assignment.create({
      data,
      include: {
        serviceOrder: true,
        provider: true,
        workTeam: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.assignment.update({
      where: { id },
      data,
    });
  }
}
