import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request, Put,
} from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Создать новый отзыв' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: { type: 'integer', example: 5, minimum: 1, maximum: 5 },
        comment: { type: 'string', example: 'Отличный сервис' },
        serviceId: { type: 'string', example: 'uuid-сервиса' },
      },
      required: ['rating', 'comment', 'serviceId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Отзыв успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные или отзыв уже существует' })
  @ApiResponse({ status: 404, description: 'Сервис не найден' })
  create(@Body() createReviewDto: any, @Request() req) {
    return this.reviewsService.create({
      ...createReviewDto,
      userId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Получить все отзывы' })
  @ApiResponse({ status: 200, description: 'Список всех отзывов' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  @ApiParam({ name: 'id', description: 'UUID отзыва', example: 'uuid-отзыва' })
  @ApiResponse({ status: 200, description: 'Найденный отзыв' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Получить отзывы по ID сервиса' })
  @ApiParam({ name: 'serviceId', description: 'UUID сервиса', example: 'uuid-сервиса' })
  @ApiResponse({ status: 200, description: 'Отзывы по указанному сервису' })
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  @ApiOperation({ summary: 'Получить отзывы текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Отзывы текущего пользователя' })
  findMyReviews(@Request() req) {
    return this.reviewsService.findByUser(req.user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Обновить отзыв' })
  @ApiParam({ name: 'id', description: 'UUID отзыва', example: 'uuid-отзыва' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: { type: 'integer', example: 4 },
        comment: { type: 'string', example: 'Обновлённый отзыв' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Отзыв успешно обновлён' })
  @ApiResponse({ status: 403, description: 'Нет прав для редактирования' })
  @ApiResponse({ status: 400, description: 'Недопустимый рейтинг' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  update(@Param('id') id: string, @Body() updateReviewDto: any, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiParam({ name: 'id', description: 'UUID отзыва', example: 'uuid-отзыва' })
  @ApiResponse({ status: 200, description: 'Отзыв успешно удалён' })
  @ApiResponse({ status: 403, description: 'Нет прав для удаления' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
}
