import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { ServicesModule } from './services.module';
import { BookingsModule } from './bookings.module';
import { ReviewsModule } from './reviews.module';
import { MessagesModule } from './messages.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    MessagesModule,
  ]
})
export class AppModule {} 