import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  Matches,
  Length, MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'dimahatcenok@gmail.com',
  })
  @IsEmail({}, { message: 'Неверный формат email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя (не менее 6 символов)',
    example: 'password123',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(64, { message: 'Пароль не должен превышать 64 символа' })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  password: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Dima',
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(1, 50, { message: 'Имя должно содержать от 1 до 50 символов' })
  @IsNotEmpty({ message: 'Имя не должно быть пустым' })
  firstName: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Hatchenok',
  })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @Length(1, 50, { message: 'Фамилия должна содержать от 1 до 50 символов' })
  @IsNotEmpty({ message: 'Фамилия не должна быть пустой' })
  lastName: string;

  @ApiProperty({
    description: 'Номер телефона пользователя (опционально)',
    example: '+375291234567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  @Matches(/^\+375(25|29|33|44)\d{7}$/, {
    message: 'Телефон должен быть в формате +375291234567',
  })
  phone?: string;

  @IsOptional()
  avatar?: any;
}
