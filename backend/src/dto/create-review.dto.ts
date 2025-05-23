import { IsNotEmpty, IsNumber, IsString, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'UUID сервиса, для которого создается отзыв',
    type: String,
    example: 'b6a724eb-3f49-4e61-b92b-01234bcdbcd1',
  })
  @IsNotEmpty({ message: 'ID сервиса обязателен' })
  @IsUUID(undefined, { message: 'ID сервиса должен быть корректным UUID' })
  serviceId: string;

  @ApiProperty({
    description: 'Рейтинг отзыва, от 1 до 5',
    type: Number,
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'Рейтинг обязателен' })
  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Рейтинг не может быть меньше 1' })
  @Max(5, { message: 'Рейтинг не может быть больше 5' })
  rating: number;

  @ApiProperty({
    description: 'Комментарий к отзыву',
    type: String,
    example: 'Отличный сервис, рекомендую!',
  })
  @IsNotEmpty({ message: 'Комментарий не должен быть пустым' })
  @IsString({ message: 'Комментарий должен быть строкой' })
  comment: string;
}
