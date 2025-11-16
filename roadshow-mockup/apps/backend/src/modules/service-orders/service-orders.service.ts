import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ServiceOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination: PaginationDto, filters?: any) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.countryCode) {
      where.countryCode = filters.countryCode;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const [orders, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignment: {
            include: {
              provider: true,
              workTeam: true,
            },
          },
          execution: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            provider: true,
            workTeam: true,
          },
        },
        execution: true,
        assignmentLog: true,
        tvOrder: true,
        installOrder: true,
      },
    });
  }

  async create(data: any) {
    return this.prisma.serviceOrder.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.serviceOrder.update({
      where: { id },
      data,
    });
  }
}
