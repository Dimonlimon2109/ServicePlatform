import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Содержание сообщения',
    type: String,
    example: 'Привет, как дела?',
  })
  @IsNotEmpty({ message: 'Содержание сообщения не должно быть пустым' })
  @IsString({ message: 'Содержание сообщения должно быть строкой' })
  content: string;

  @ApiProperty({
    description: 'ID получателя сообщения (UUID)',
    type: String,
    example: 'b6a724eb-3f49-4e61-b92b-01234bcdbcd1',
  })
  @IsNotEmpty({ message: 'ID получателя обязателен' })
  @IsUUID(undefined, { message: 'ID получателя должен быть корректным UUID' })
  receiverId: string;
}
