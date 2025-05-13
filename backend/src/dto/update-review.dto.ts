import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({
    description: 'Рейтинг отзыва, от 1 до 5. Необязательное поле для обновления отзыва.',
    type: Number,
    example: 4,
    minimum: 1,
    maximum: 5,
    required: false,  // Это необязательное поле
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Комментарий к отзыву. Необязательное поле для обновления отзыва.',
    type: String,
    example: 'Обновленный комментарий',
    required: false,  // Это необязательное поле
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
