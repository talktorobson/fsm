import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(countryCode?: string) {
    return this.prisma.provider.findMany({
      where: countryCode ? { countryCode } : undefined,
      include: {
        workTeams: true,
        metrics: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: {
        workTeams: true,
        zones: true,
        metrics: true,
      },
    });
  }

  async create(data: any) {
    // TODO: Add proper DTO validation
    return this.prisma.provider.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.provider.update({
      where: { id },
      data,
    });
  }

  async getMetrics(id: string) {
    return this.prisma.providerMetrics.findUnique({
      where: { providerId: id },
    });
  }
}
