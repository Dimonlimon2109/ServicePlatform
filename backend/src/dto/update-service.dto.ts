import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';
import {Transform} from "class-transformer";

export class UpdateServiceDto {
    @ApiPropertyOptional({ description: 'Обновленное название услуги' })
    @IsOptional()
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Обновленное описание услуги' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiPropertyOptional({ description: 'Обновленная цена услуги' })
    @IsOptional()
    @Transform(({value}) => parseFloat(value))
    @IsNumber()
    price: number;

    @ApiPropertyOptional({ description: 'Обновленная категория услуги' })
    @IsOptional()
    @IsString()
    category: string;

    @ApiPropertyOptional({ description: 'Обновленная продолжительность' })
    @IsOptional()
    @Transform(({value}) => parseInt(value))
    @IsInt()
    @Min(1)
    duration: number;
}
