import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';

@ApiTags('Сообщения')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать сообщение' })
  @ApiResponse({ status: 201, description: 'Сообщение успешно создано' })
  create(@Body() dto: CreateMessageDto, @Request() req) {
    return this.messagesService.create({
      ...dto,
      senderId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Получить все сообщения (только для администраторов)' })
  @ApiResponse({ status: 200, description: 'Список всех сообщений' })
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сообщение по ID' })
  @ApiResponse({ status: 200, description: 'Сообщение найдено' })
  @ApiParam({ name: 'id', description: 'ID сообщения' })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Получить мои сообщения' })
  @ApiResponse({ status: 200, description: 'Список сообщений текущего пользователя' })
  findMyMessages(@Request() req) {
    return this.messagesService.findByUser(req.user.id);
  }

  @Get('chat/:userId')
  @ApiOperation({ summary: 'Получить сообщения между пользователями' })
  @ApiResponse({ status: 200, description: 'Список сообщений между двумя пользователями' })
  @ApiParam({ name: 'userId', description: 'ID второго пользователя' })
  findChatMessages(@Param('userId') userId: string, @Request() req) {
    return this.messagesService.findByUsers(req.user.id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить своё сообщение' })
  @ApiResponse({ status: 200, description: 'Сообщение обновлено' })
  @ApiParam({ name: 'id', description: 'ID сообщения для обновления' })
  update(
      @Param('id') id: string,
      @Body() dto: UpdateMessageDto,
      @Request() req,
  ) {
    return this.messagesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить своё сообщение' })
  @ApiResponse({ status: 200, description: 'Сообщение удалено' })
  @ApiParam({ name: 'id', description: 'ID сообщения для удаления' })
  remove(@Param('id') id: string, @Request() req) {
    return this.messagesService.remove(id, req.user.id);
  }
}
