import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExecutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.execution.findUnique({
      where: { id },
      include: {
        serviceOrder: true,
      },
    });
  }

  async checkIn(id: string, checkInData: any) {
    return this.prisma.execution.update({
      where: { id },
      data: {
        checkInTime: new Date(),
        checkInLatitude: checkInData.latitude,
        checkInLongitude: checkInData.longitude,
        status: 'IN_PROGRESS',
      },
    });
  }

  async checkOut(id: string, checkOutData: any) {
    return this.prisma.execution.update({
      where: { id },
      data: {
        checkOutTime: new Date(),
        checkOutLatitude: checkOutData.latitude,
        checkOutLongitude: checkOutData.longitude,
        status: 'COMPLETED',
      },
    });
  }

  async uploadPhoto(id: string, photoData: any) {
    // TODO: Implement S3 upload or local file storage
    return {
      executionId: id,
      photoUrl: 'https://placeholder.com/photo.jpg',
      uploadedAt: new Date(),
    };
  }

  async rateService(id: string, ratingData: any) {
    return this.prisma.execution.update({
      where: { id },
      data: {
        customerRating: ratingData.rating,
        customerComment: ratingData.comment,
      },
    });
  }
}
