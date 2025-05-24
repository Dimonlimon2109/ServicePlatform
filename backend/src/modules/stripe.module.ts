import {forwardRef, Module} from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import {BookingsModule} from "./bookings.module";
import {StripeController} from "../controllers/stripe.controller";
import {MailModule} from "./mail.module";

@Module({
    imports: [forwardRef(() => BookingsModule), MailModule], // Используем forwardRef для предотвращения циклической зависимости
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService], // Обязательно экспортируем!
})
export class StripeModule {}
