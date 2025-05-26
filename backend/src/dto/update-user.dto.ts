import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  Matches,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Dima',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @Length(1, 50, { message: 'Имя должно содержать от 1 до 50 символов' })
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Khatchenok',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @Length(1, 50, { message: 'Фамилия должна содержать от 1 до 50 символов' })
  lastName?: string;

  @ApiProperty({
    description: 'Номер телефона в формате +375291234567',
    example: '+375291234567',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  @Matches(/^\+375(25|29|33|44)\d{7}$/, {
    message: 'Телефон должен быть в формате +375291234567',
  })
  phone?: string;

  @ApiProperty({
    description: 'Путь к файлу аватара',
    example: '/uploads/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Путь к фото должен быть строкой' })
  profilePhotoPath?: string;
}
