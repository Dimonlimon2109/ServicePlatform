// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) {}

    async saveMessage(dto: SendMessageDto) {
        return this.prisma.message.create({
            data: {
                senderId: dto.senderId,
                receiverId: dto.receiverId,
                content: dto.content,
            },
        });
    }

    async getChatHistory(userId: string, companionId: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: companionId },
                    { senderId: companionId, receiverId: userId },
                ],
            },
            orderBy: { sentAt: 'asc' },
        });
    }
}
