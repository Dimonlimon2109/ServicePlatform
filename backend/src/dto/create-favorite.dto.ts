import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFavoriteDto {
    @ApiProperty({ example: 'cfa677b0-2f85-48ec-bc29-d29e50de18f4' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: '12e629ad-0e5a-4a70-8013-1aa0e2d94ad2' })
    @IsUUID()
    serviceId: string;
}
