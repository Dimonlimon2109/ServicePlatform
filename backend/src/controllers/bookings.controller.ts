import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request
} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam
} from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую бронь' })
  @ApiResponse({ status: 201, description: 'Бронирование успешно создано.' })
  @ApiResponse({ status: 400, description: 'Неверные данные для создания брони.' })
  @ApiBody({
    description: 'Данные для создания брони',
    schema: {
      type: 'object',
      properties: {
        serviceId: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        status: {
          type: 'string',
          enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
        },
      },
      required: ['serviceId', 'date', 'status'],
    },
  })
  create(@Body() createBookingDto: any, @Request() req) {
    return this.bookingsService.create({
      ...createBookingDto,
      userId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Получить все бронирования' })
  @ApiResponse({ status: 200, description: 'Возвращает список всех бронирований.' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить бронь по ID' })
  @ApiParam({ name: 'id', description: 'Идентификатор брони' })
  @ApiResponse({ status: 200, description: 'Бронирование найдено.' })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено.' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Получить свои бронирования' })
  @ApiResponse({ status: 200, description: 'Возвращает бронирования текущего пользователя.' })
  findMyBookings(@Request() req) {
    return this.bookingsService.findByUser(req.user.id);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Получить бронирования по ID услуги' })
  @ApiParam({ name: 'serviceId', description: 'Идентификатор услуги' })
  @ApiResponse({ status: 200, description: 'Возвращает список бронирований услуги.' })
  findByService(@Param('serviceId') serviceId: string) {
    return this.bookingsService.findByService(serviceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить бронь' })
  @ApiParam({ name: 'id', description: 'Идентификатор брони' })
  @ApiResponse({ status: 200, description: 'Бронирование успешно обновлено.' })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено.' })
  @ApiBody({
    description: 'Данные для обновления брони',
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', format: 'date-time', nullable: true },
        status: {
          type: 'string',
          enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
          nullable: true,
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateBookingDto: any) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить бронь' })
  @ApiParam({ name: 'id', description: 'Идентификатор брони' })
  @ApiResponse({ status: 200, description: 'Бронирование успешно удалено.' })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено.' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
