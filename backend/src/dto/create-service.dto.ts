import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
    @ApiProperty({ example: 'Маникюр', description: 'Название услуги' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Профессиональный маникюр с покрытием', description: 'Описание услуги' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 35.50, description: 'Цена услуги' })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Цена должна быть числом' })
    @Min(0, { message: 'Цена не может быть отрицательной' })
    price: number;

    @ApiProperty({ example: 'Красота', description: 'Категория услуги' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 60, description: 'Продолжительность в минутах' })
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt({ message: 'Продолжительность должна быть целым числом' })
    @Min(1, { message: 'Продолжительность должна быть минимум 1 минута' })
    duration: number;
}
