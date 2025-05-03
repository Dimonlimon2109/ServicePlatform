import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Put
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
  @ApiOperation({ summary: 'Получить свои бронирования с пагинацией и фильтрацией' })
  @ApiResponse({ status: 200, description: 'Возвращает бронирования текущего пользователя.' })
  @ApiParam({ name: 'status', required: false, description: 'Фильтрация по статусу' })
  @ApiParam({ name: 'startDate', required: false, description: 'Дата начала диапазона' })
  @ApiParam({ name: 'endDate', required: false, description: 'Дата конца диапазона' })
  @ApiParam({ name: 'page', required: false, description: 'Номер страницы (по умолчанию 1)' })
  @ApiParam({ name: 'limit', required: false, description: 'Количество элементов на странице (по умолчанию 10)' })
  findMyBookings(
      @Request() req,
      @Query('status') status?: string,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
      @Query('page') page = '1',
      @Query('limit') limit = '10',
  ) {
    return this.bookingsService.findByUser(req.user.id, {
      status,
      startDate,
      endDate,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }
  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Получить бронирования по ID услуги с пагинацией и фильтрами' })
  @ApiParam({ name: 'serviceId', description: 'Идентификатор услуги' })
  @ApiParam({ name: 'status', required: false, description: 'Фильтрация по статусу' })
  @ApiParam({ name: 'startDate', required: false, description: 'Дата начала диапазона' })
  @ApiParam({ name: 'endDate', required: false, description: 'Дата конца диапазона' })
  @ApiParam({ name: 'page', required: false, description: 'Номер страницы (по умолчанию 1)' })
  @ApiParam({ name: 'limit', required: false, description: 'Элементов на странице (по умолчанию 10)' })
  @ApiResponse({ status: 200, description: 'Возвращает список бронирований услуги.' })
  findByService(
      @Param('serviceId') serviceId: string,
      @Query('status') status?: string,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
      @Query('page') page = '1',
      @Query('limit') limit = '10',
  ) {
    return this.bookingsService.findByService(serviceId, {
      status,
      startDate,
      endDate,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }


  @Put(':id')
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
