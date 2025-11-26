import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PerformanceQueryDto } from './dto/performance-query.dto';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(query: PerformanceQueryDto) {
    const { startDate, endDate, countryCode, businessUnit } = query;
    
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (countryCode) where.countryCode = countryCode;
    if (businessUnit) where.businessUnit = businessUnit;

    const totalServiceOrders = await this.prisma.serviceOrder.count({ where });
    
    const completedServiceOrders = await this.prisma.serviceOrder.count({
      where: {
        ...where,
        state: { in: ['COMPLETED', 'VALIDATED', 'CLOSED'] },
      },
    });

    const overallCompletionRate = totalServiceOrders > 0 
      ? (completedServiceOrders / totalServiceOrders) * 100 
      : 0;

    // Mock top performers for now as we don't have enough data/logic for complex ranking
    const topPerformers = {
      operators: [
        { id: '1', name: 'Alice Operator', score: 98 },
        { id: '2', name: 'Bob Manager', score: 95 },
      ],
      providers: [
        { id: '1', name: 'FastFix Inc.', score: 99 },
        { id: '2', name: 'Reliable Techs', score: 97 },
      ],
    };

    const alerts = [
      {
        type: 'warning',
        message: 'High volume of P1 tickets in Madrid',
        entity: 'Region',
        entityId: 'ES-MD',
      },
    ];

    return {
      totalServiceOrders,
      completedServiceOrders,
      overallCompletionRate: Number(overallCompletionRate.toFixed(1)),
      averageCustomerSatisfaction: 4.5, // Mock
      topPerformers,
      alerts,
    };
  }

  async getOperatorPerformance(query: PerformanceQueryDto) {
    // In a real scenario, we would group service orders by operator (e.g. createdBy or assignedOperatorId)
    // For now, we'll return mock data to satisfy the frontend contract
    
    const operators = [
      {
        operatorId: 'op-1',
        operatorName: 'Alice Operator',
        countryCode: 'ES',
        metrics: {
          totalServiceOrders: 150,
          completedServiceOrders: 142,
          completionRate: 94.6,
          averageCompletionTime: 2.5,
          onTimeDeliveryRate: 98,
          customerSatisfactionScore: 4.8,
          activeServiceOrders: 8,
          p1ResponseTime: 2.1,
          p2ResponseTime: 24.5,
        },
        period: {
          startDate: query.startDate || '2025-01-01',
          endDate: query.endDate || '2025-01-31',
        },
        trends: {
          completionRateTrend: 'up',
          satisfactionTrend: 'stable',
        },
      },
      {
        operatorId: 'op-2',
        operatorName: 'Bob Manager',
        countryCode: 'FR',
        metrics: {
          totalServiceOrders: 120,
          completedServiceOrders: 110,
          completionRate: 91.6,
          averageCompletionTime: 3.1,
          onTimeDeliveryRate: 95,
          customerSatisfactionScore: 4.6,
          activeServiceOrders: 10,
          p1ResponseTime: 2.5,
          p2ResponseTime: 28.0,
        },
        period: {
          startDate: query.startDate || '2025-01-01',
          endDate: query.endDate || '2025-01-31',
        },
        trends: {
          completionRateTrend: 'stable',
          satisfactionTrend: 'up',
        },
      },
    ];

    return {
      operators,
      total: operators.length,
    };
  }
}
