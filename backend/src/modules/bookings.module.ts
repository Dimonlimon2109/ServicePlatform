import { Module } from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { BookingsController } from '../controllers/bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {} 