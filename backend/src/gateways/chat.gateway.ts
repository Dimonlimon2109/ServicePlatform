import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from '../services/chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly chatService: ChatService) {}

    private userSockets = new Map<string, string>();

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        // Удаление userId по socketId
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('register')
    handleRegister(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
        this.userSockets.set(userId, client.id);
        console.log(`Client registered, all users: ${this.userSockets.size}`);
        console.log(`User ${userId} registered with socket ${client.id}`);
    }

    @SubscribeMessage('send_message')
    async handleMessage(
        @MessageBody() data: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {

        const message = await this.chatService.saveMessage(data);

        const receiverSocketId = this.userSockets.get(data.receiverId);
        console.log(`Received message from ${JSON.stringify(receiverSocketId)}`);
        if (receiverSocketId) {
            client.to(receiverSocketId).emit('receive_message', message);
        }

        return message;
    }
}
