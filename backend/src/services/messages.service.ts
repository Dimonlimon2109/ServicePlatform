import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateMessageData = {
  content: string;
  senderId: string;
  recipientId: string;
};

type UpdateMessageData = {
  content: string;
};

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageData) {
    return this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        recipientId: data.recipientId,
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async findAll() {
    return this.prisma.message.findMany({
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async findOne(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: true,
        recipient: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async findByUser(userId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async findByUsers(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 },
        ],
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async update(id: string, data: UpdateMessageData) {
    await this.findOne(id);

    return this.prisma.message.update({
      where: { id },
      data: {
        content: data.content,
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.message.delete({
      where: { id },
    });

    return { message: 'Message deleted successfully' };
  }
} 