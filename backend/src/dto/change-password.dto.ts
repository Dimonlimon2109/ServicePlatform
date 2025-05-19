import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Текущий пароль пользователя',
  })
  @IsString({ message: 'Текущий пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Текущий пароль не должен быть пустым' })
  @MinLength(6, { message: 'Минимальная длина текущего пароля — 6 символов' })
  @MaxLength(64, { message: 'Максимальная длина текущего пароля — 64 символа' })
  currentPassword: string;

  @ApiProperty({
    example: 'newSecurePassword456',
    description: 'Новый пароль пользователя',
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль не должен быть пустым' })
  @MinLength(6, { message: 'Минимальная длина нового пароля — 6 символов' })
  @MaxLength(64, { message: 'Максимальная длина нового пароля — 64 символа' })
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&_-]{6,}$/, {
  //   message: 'Новый пароль должен содержать минимум одну букву и одну цифру',
  // })
  newPassword: string;
}
