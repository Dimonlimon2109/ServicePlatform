import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'dimahatcenok@gmail.com',
    description: 'Email адрес пользователя',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль для входа в систему',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(64, { message: 'Пароль не должен превышать 64 символа' })
  password: string;
}
