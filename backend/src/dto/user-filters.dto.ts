import {IsOptional, IsString, IsBoolean, IsNumberString} from 'class-validator';
import {Transform} from "class-transformer";

export class UserFiltersDto {

    @IsOptional()
    @IsNumberString({}, { message: 'page должен быть числом' })
    page?: string;

    @IsOptional()
    @IsNumberString({}, { message: 'limit должен быть числом' })
    limit?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean({ message: 'isBlocked должен быть булевым значением' })
    isBlocked?: boolean;
}
