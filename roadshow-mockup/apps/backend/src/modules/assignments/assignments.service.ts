import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async executeFunnel(funnelInput: any) {
    // TODO: Implement complete 6-stage assignment funnel
    // This is the PRIMARY DIFFERENTIATOR - assignment transparency
    return {
      message: 'Assignment funnel - to be implemented',
      totalProviders: 0,
      eligibleProviders: [],
      funnelSteps: [],
    };
  }

  async create(data: any) {
    return this.prisma.assignment.create({
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        provider: true,
        serviceOrder: true,
        logs: true,
      },
    });
  }

  async getFunnelTransparency(id: string) {
    // TODO: Return complete funnel transparency data
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { logs: true },
    });

    return {
      assignmentId: id,
      funnelData: assignment?.funnelData || {},
      logs: assignment?.logs || [],
    };
  }

  async getLogs(id: string) {
    return this.prisma.assignmentLog.findMany({
      where: { assignmentId: id },
      orderBy: { timestamp: 'asc' },
    });
  }

  async accept(id: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });
  }

  async refuse(id: string, reason?: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: {
        status: 'REFUSED',
        // Store refusal reason in metadata if needed
      },
    });
  }
}
