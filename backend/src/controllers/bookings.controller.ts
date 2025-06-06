import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Put, Req, RawBodyRequest, Res
} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam
} from '@nestjs/swagger';
import {StripeService} from "../services/stripe.service";
import Stripe from "stripe";
import { Response, Request as ExpressRequest } from 'express';
import {ConfigService} from "@nestjs/config";


@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService,
              private readonly stripeService: StripeService,
              private readonly configService: ConfigService) {}

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
    return this.bookingsService.createBooking({
      ...createBookingDto,
      userId: req.user.id,
    });
  }

  // @Get()
  // @ApiOperation({ summary: 'Получить все бронирования' })
  // @ApiResponse({ status: 200, description: 'Возвращает список всех бронирований.' })
  // findAllBookings() {
  //   return this.bookingsService.findAll();
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Получить бронь по ID' })
  // @ApiParam({ name: 'id', description: 'Идентификатор брони' })
  // @ApiResponse({ status: 200, description: 'Бронирование найдено.' })
  // @ApiResponse({ status: 404, description: 'Бронирование не найдено.' })
  // findBooking(@Param('id') id: string) {
  //   return this.bookingsService.findOne(id);
  // }

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
    return this.bookingsService.findBookingsByUser(req.user.id, {
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
    return this.bookingsService.findBookingsByService(serviceId, {
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
    return this.bookingsService.updateBooking(id, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить бронь' })
  @ApiParam({ name: 'id', description: 'Идентификатор брони' })
  @ApiResponse({ status: 200, description: 'Бронирование успешно удалено.' })
  @ApiResponse({ status: 404, description: 'Бронирование не найдено.' })
  remove(@Param('id') id: string) {
    return this.bookingsService.removeBooking(id);
  }

  @Post('pay')
  async payForBooking(
      @Body() body: { bookingId: string; amount: number },
  ) {
    console.log(body);
    return this.stripeService.createCheckoutSession({bookingId: body.bookingId, amount: body.amount});
  }

  @Post('webhook')
  async handleStripeWebhook(
      @Req() req: RawBodyRequest<ExpressRequest>,
      @Res() res: Response
  ) {
    let event: Stripe.Event;
    const signature = req.headers['stripe-signature'];
    try {
      event = this.stripeService.getStripe().webhooks.constructEvent(
          req.rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await this.stripeService.handleWebhook(event);
    res.status(200).json({ received: true });
  }

}
