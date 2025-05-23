import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Favorites - Избранные услуги')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Добавить услугу в избранное' })
    @ApiBody({
        type: CreateFavoriteDto,
        description: 'Данные для добавления в избранное',
    })
    @ApiCreatedResponse({
        description: 'Услуга успешно добавлена в избранное',
        schema: {
            example: {
                id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                userId: 'u1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                serviceId: 's1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                createdAt: '2023-05-20T12:00:00.000Z',
                service: {
                    id: 's1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                    title: 'Массаж спины',
                    description: 'Профессиональный массаж',
                    price: 2500,
                    category: 'Массаж',
                    photoPath: 'massage.jpg',
                    duration: 60,
                    rating: 4.8,
                    providerId: 'p1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                    createdAt: '2023-05-15T10:00:00.000Z',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Услуга уже в избранном или неверные данные',
        schema: {
            example: {
                statusCode: 400,
                message: 'Service already in favorites',
                error: 'Bad Request',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Пользователь или услуга не найдены',
        schema: {
            example: {
                statusCode: 404,
                message: 'User or Service not found',
                error: 'Not Found',
            },
        },
    })
    addToFavorites(@Body() dto: CreateFavoriteDto) {
        return this.favoritesService.addToFavorites(dto);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удалить услугу из избранного' })
    @ApiBody({
        type: CreateFavoriteDto,
        description: 'Данные для удаления из избранного',
    })
    @ApiNoContentResponse({
        description: 'Услуга успешно удалена из избранного',
    })
    @ApiNotFoundResponse({
        description: 'Запись в избранном не найдена',
        schema: {
            example: {
                statusCode: 404,
                message: 'Favorite not found',
                error: 'Not Found',
            },
        },
    })
    removeFromFavorites(@Body() dto: CreateFavoriteDto) {
        return this.favoritesService.removeFromFavorites(dto);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Получить избранные услуги пользователя' })
    @ApiParam({
        name: 'userId',
        type: String,
        description: 'UUID пользователя',
        example: 'u1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
    })
    @ApiResponse({
        status: 200,
        description: 'Список избранных услуг',
        schema: {
            example: [
                {
                    id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                    userId: 'u1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                    serviceId: 's1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                    createdAt: '2023-05-20T12:00:00.000Z',
                    service: {
                        id: 's1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                        title: 'Массаж спины',
                        description: 'Профессиональный массаж',
                        price: 2500,
                        category: 'Массаж',
                        photoPath: 'massage.jpg',
                        duration: 60,
                        rating: 4.8,
                        provider: {
                            id: 'p1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                            name: 'Иван Иванов',
                            email: 'ivan@example.com',
                        },
                        createdAt: '2023-05-15T10:00:00.000Z',
                    },
                },
            ],
        },
    })
    @ApiNotFoundResponse({
        description: 'Пользователь не найден',
        schema: {
            example: {
                statusCode: 404,
                message: 'User not found',
                error: 'Not Found',
            },
        },
    })
    getUserFavorites(@Param('userId') userId: string) {
        return this.favoritesService.getUserFavorites(userId);
    }
}
