import { ApiProperty } from '@nestjs/swagger';
import {IsString, IsNotEmpty, MinLength} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ example: 'newSecurePassword456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
