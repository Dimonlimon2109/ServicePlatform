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
    const service = await this.prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Сервис не найден');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Рейтинг должен быть между 1 и 5');
    }

    const review = await this.prisma.review.create({
      data,
      include: { service: true, user: true },
    });

    await this.updateServiceRating(data.serviceId);

    return review;
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
      throw new NotFoundException('Отзыв не найден');
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

  async update(
      id: string,
      data: { rating?: number; comment?: string },
      userId: string,
  ) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои отзывы');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestException('Рейтинг должен быть между 1 и 5');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data,
      include: { service: true, user: true },
    });

    if (data.rating !== undefined && data.rating !== review.rating) {
      await this.updateServiceRating(review.serviceId);
    }

    return updatedReview;
  }


  async remove(id: string, userId: string) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('Вы можете удалить только свои отзывы');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    await this.updateServiceRating(review.serviceId);

    return { message: 'Отзыв успешно удалён' };
  }


  private async updateServiceRating(serviceId: string): Promise<void> {
    const reviews = await this.prisma.review.findMany({
      where: { serviceId },
      select: { rating: true },
    });

    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    await this.prisma.service.update({
      where: { id: serviceId },
      data: { rating: parseFloat(avgRating.toFixed(2)) }, // округление до 2 знаков
    });
  }

}
