import { Module } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { MessagesController } from '../controllers/messages.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, PrismaService],
  exports: [MessagesService],
})
export class MessagesModule {} 