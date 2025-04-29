import { IsString, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {Transform} from "class-transformer";

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
    @Transform(({value}) => parseFloat(value))
    @IsNumber()
    price: number;

    @ApiProperty({ example: 'Красота', description: 'Категория услуги' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: 60, description: 'Продолжительность в минутах' })
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1)
    duration: number;
}
