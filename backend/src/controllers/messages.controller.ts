import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'The message has been successfully created.' })
  create(@Body() createMessageDto: any, @Request() req) {
    return this.messagesService.create({
      ...createMessageDto,
      senderId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({ status: 200, description: 'Return all messages.' })
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by id' })
  @ApiResponse({ status: 200, description: 'Return the message.' })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Get current user\'s messages' })
  @ApiResponse({ status: 200, description: 'Return the current user\'s messages.' })
  findMyMessages(@Request() req) {
    return this.messagesService.findByUser(req.user.id);
  }

  @Get('chat/:userId')
  @ApiOperation({ summary: 'Get chat messages between current user and another user' })
  @ApiResponse({ status: 200, description: 'Return the chat messages.' })
  findChatMessages(@Param('userId') userId: string, @Request() req) {
    return this.messagesService.findByUsers(req.user.id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ status: 200, description: 'The message has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateMessageDto: any) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'The message has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
} 