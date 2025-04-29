import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'dimahatcenok@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Dima',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Hatcenok',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Номер телефона пользователя',
    example: '+375291234567',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone: string;
} 