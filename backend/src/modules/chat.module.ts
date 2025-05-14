import { Module } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from '../gateways/chat.gateway';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    providers: [ChatService, ChatGateway, PrismaService],
})
export class ChatModule {}
