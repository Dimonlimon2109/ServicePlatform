import { IsNotEmpty, IsNumber, IsString, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'UUID сервиса, для которого создается отзыв',
    type: String,
    example: 'b6a724eb-3f49-4e61-b92b-01234bcdbcd1',
  })
  @IsNotEmpty()
  @IsUUID()  // Проверка, что serviceId является UUID
  serviceId: string;

  @ApiProperty({
    description: 'Рейтинг отзыва, от 1 до 5',
    type: Number,
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Комментарий к отзыву',
    type: String,
    example: 'Отличный сервис, рекомендую!',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}
