import {
    IsOptional,
    IsString,
    IsNumber,
    IsInt,
    Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateServiceDto {
    @ApiPropertyOptional({ description: 'Обновленное название услуги' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ description: 'Обновленное описание услуги' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Обновленная цена услуги' })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Цена должна быть числом' })
    @Min(0, { message: 'Цена не может быть отрицательной' })
    price?: number;

    @ApiPropertyOptional({ description: 'Обновленная категория услуги' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Обновленная продолжительность в минутах' })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt({ message: 'Продолжительность должна быть целым числом' })
    @Min(1, { message: 'Продолжительность должна быть минимум 1 минута' })
    duration?: number;
}
