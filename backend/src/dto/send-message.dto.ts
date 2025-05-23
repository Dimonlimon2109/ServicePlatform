import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
