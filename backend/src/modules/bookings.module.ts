import {forwardRef, Module} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { BookingsController } from '../controllers/bookings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import {StripeModule} from "./stripe.module";

@Module({
  imports: [PrismaModule, forwardRef(() => StripeModule)], // Используем forwardRef для предотвращения циклической зависимости
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
