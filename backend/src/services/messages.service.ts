import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CreateMessageData = {
  content: string;
  receiverId: string;
  senderId: string;

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
        receiverId: data.receiverId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async findAll() {
    return this.prisma.message.findMany({
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async findOne(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true,
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
          { receiverId: userId },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async findByUsers(userId1: string, userId2: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async update(id: string, data: UpdateMessageData, userId: string) {
    const message = await this.findOne(id);

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать это сообщение');
    }

    return this.prisma.message.update({
      where: { id },
      data: {
        content: data.content,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const message = await this.findOne(id);

    if (message.senderId !== userId) {
      throw new ForbiddenException('Вы не можете удалить это сообщение');
    }

    await this.prisma.message.delete({
      where: { id },
    });

    return { message: 'Сообщение успешно удалено' };
  }

}
