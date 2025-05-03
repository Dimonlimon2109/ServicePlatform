import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateServiceData = {
  title: string;
  description: string;
  price: number;
  category: string;
  providerId: string;
  photoPath: string;
  duration: number;
};

type ServiceFilters = {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
};

type UpdateServiceData = Partial<Omit<CreateServiceData, 'providerId'>>;

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServiceData) {
    const { title, description, price, category, providerId, photoPath, duration } = data;

    return this.prisma.service.create({
      data: {
        title,
        description,
        price,
        category,
        photoPath,
        duration,
        provider: {
          connect: { id: providerId },
        },
      },
      include: {
        provider: true,
        reviews: true,
      },
    });
  }

  async findAll(page: number, limit: number, filters: ServiceFilters) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.category) {
      where.category = filters.category;
    }

    const [services, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        skip,
        take: limit,
        where,
        include: {
          provider: true,
          reviews: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
        reviews: {
          include:{
            user:true
          }
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findByCategory(category: string) {
    return this.prisma.service.findMany({
      where: { category },
      include: {
        provider: true,
        reviews: true,
      },
    });
  }

  async findByProvider(providerId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [services, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        skip,
        take: limit,
        where: { providerId },
        include: {
          provider: true,
          reviews: true,
        },
      }),
      this.prisma.service.count(),
    ]);
    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async findMyServices(userId: string) {
    return this.prisma.service.findMany({
      where: { providerId: userId },
      include: {
        provider: true,
        reviews: true,
      },
    });
  }

  async update(id: string, data: UpdateServiceData, userId: string) {
    const service = await this.findOne(id);

    if (service.providerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this service.');
    }

    return this.prisma.service.update({
      where: { id },
      data,
      include: {
        provider: true,
        reviews: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const service = await this.findOne(id);

    if (service.providerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this service.');
    }

    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Service deleted successfully' };
  }
}
