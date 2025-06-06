import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
    constructor(private prisma: PrismaService) {}

    async addToFavorites(dto: CreateFavoriteDto) {
        const existing = await this.prisma.favorite.findUnique({
            where: {
                userId_serviceId: {
                    userId: dto.userId,
                    serviceId: dto.serviceId,
                },
            },
        });

        if (existing) {
            throw new HttpException(
                'Сервис уже находится в избранном',
                HttpStatus.BAD_REQUEST,
            );
        }

        return this.prisma.favorite.create({
            data: {
                user: { connect: { id: dto.userId } },
                service: { connect: { id: dto.serviceId } },
            },
            include: {
                service: true,
            },
        });
    }

    async removeFromFavorites(userId: string, serviceId: string) {
        return this.prisma.favorite.delete({
            where: {
                userId_serviceId: {
                    userId,
                    serviceId,
                },
            },
        });
    }


    async getUserFavorites(userId: string) {
        return this.prisma.favorite.findMany({
            where: { userId },
            include: {
                service: {
                    include: {
                        provider: true,
                    },
                },
            },
        });
    }
}
