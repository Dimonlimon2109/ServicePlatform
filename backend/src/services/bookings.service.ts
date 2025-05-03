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

  async findByUser(
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

  async findByService(
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
