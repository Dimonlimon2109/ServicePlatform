import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    rating: number;
    comment: string;
    serviceId: string;
    userId: string;
  }) {
    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if user already reviewed this service
    const existingReview = await this.prisma.review.findFirst({
      where: {
        serviceId: data.serviceId,
        userId: data.userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this service');
    }

    return this.prisma.review.create({
      data,
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        service: true,
        user: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async findByService(serviceId: string) {
    return this.prisma.review.findMany({
      where: { serviceId },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async update(id: string, data: { rating?: number; comment?: string }, userId: string) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.prisma.review.update({
      where: { id },
      data,
      include: {
        service: true,
        user: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return { message: 'Review deleted successfully' };
  }
} 