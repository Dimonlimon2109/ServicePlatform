import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { ServicesModule } from './services.module';
import { BookingsModule } from './bookings.module';
import { ReviewsModule } from './reviews.module';
import { MessagesModule } from './messages.module';
import { PrismaModule } from '../prisma/prisma.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from 'path';
import {StripeModule} from "./stripe.module";
import {ChatModule} from "./chat.module";
import {FavoritesModule} from "./favorites.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
      FavoritesModule,
    ReviewsModule,
    MessagesModule,
    StripeModule,
      ChatModule,
  ]
})
export class AppModule {}
