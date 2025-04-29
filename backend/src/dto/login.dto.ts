import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'dimahatcenok@gmail.com',
    description: 'Email адрес пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль для входа в систему',
  })
  @IsString()
  @MinLength(6)
  password: string;
} 