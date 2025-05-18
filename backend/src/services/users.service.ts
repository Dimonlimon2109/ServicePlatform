import {Injectable, NotFoundException, ConflictException, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

interface UserFilters {
  email?: string;
  isBlocked?: boolean;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const { role, ...userData } = data;

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        userType: 'USER',
        phone: userData.phone || '',
      },
    });
  }

  async findAll(page: number, limit: number, filters: UserFilters) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    if (filters.isBlocked !== undefined) {
      where.isBlocked = filters.isBlocked;
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          profilePhotoPath: true,
          isBlocked: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        profilePhotoPath: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePhotoPath?: string;
  }) {
   const user =  await this.findOne(id);


    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        userType: true,
        profilePhotoPath: true,
        createdAt: true,
      },
    });
  }

  async changePassword(
      id: string,
      currentPassword: string,
      newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильный текущий пароль');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return true;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async toggleBlockUser(id: string, isBlocked: boolean) {
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isBlocked: true,
      },
    });
  }

}
