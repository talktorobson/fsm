import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, filters?: any) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.countryCode) {
      where.countryCode = filters.countryCode;
    }
    if (filters?.buCode) {
      where.buCode = filters.buCode;
    }
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const [providers, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        skip,
        take: limit,
        include: {
          workTeams: true,
          zones: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.provider.count({ where }),
    ]);

    return {
      data: providers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      include: {
        workTeams: true,
        zones: true,
        assignments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.provider.create({
      data,
      include: {
        workTeams: true,
        zones: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.provider.update({
      where: { id },
      data,
      include: {
        workTeams: true,
        zones: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.provider.delete({
      where: { id },
    });
  }
}
