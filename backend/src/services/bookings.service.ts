import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {MailService} from "./mail.service";

type CreateBookingData = {
  serviceId: string;
  userId: string;
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PAID';
};

type UpdateBookingData = Partial<{
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PAID';
}>;

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService,
              private mailService: MailService) {}

  async createBooking(data: CreateBookingData) {
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

  async findBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Бронирование не найдено');
    }

    return booking;
  }

  async findBookingsByUser(
      userId: string,
      options?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      },
  ) {
    const where: any = {
      userId,
    };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.date.lte = new Date(options.endDate);
      }
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          service: true,
          user: true,
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }

  async findBookingsByService(
      serviceId: string,
      options?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
  ) {
    const where: any = { serviceId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.date.lte = new Date(options.endDate);
      }
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          service: true,
          user: true,
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      total,
      page,
      limit,
      items,
    };
  }


  async updateBooking(id: string, data: UpdateBookingData) {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: {
        date: data.date,
        status: data.status,
      },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
        user: true,
      },
    });

    if (data.status && data.status !== 'PAID') {
      await this.mailService.sendOrderStatusChangeEmail({
        to: booking.user.email,
        userName: booking.user.firstName,
        serviceTitle: booking.service.title,
        newStatus: data.status,
        providerName: `${booking.service.provider.firstName} ${booking.service.provider.lastName}`,
      });
    }

    return booking;
  }

  async removeBooking(id: string) {
    await this.findBooking(id);

    await this.prisma.booking.delete({
      where: { id },
    });

    return { message: 'Бронирование успешно удалено' };
  }
}
