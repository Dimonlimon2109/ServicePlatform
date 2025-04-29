import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateBookingData = {
  serviceId: string;
  userId: string;
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
};

type UpdateBookingData = Partial<{
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}>;

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBookingData) {
    return this.prisma.booking.create({
      data: {
        serviceId: data.serviceId,
        userId: data.userId,
        date: data.date,
        status: data.status,
      },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async findByService(serviceId: string) {
    return this.prisma.booking.findMany({
      where: { serviceId },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async update(id: string, data: UpdateBookingData) {
    await this.findOne(id);

    return this.prisma.booking.update({
      where: { id },
      data: {
        date: data.date,
        status: data.status,
      },
      include: {
        service: true,
        user: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.booking.delete({
      where: { id },
    });

    return { message: 'Booking deleted successfully' };
  }
} 