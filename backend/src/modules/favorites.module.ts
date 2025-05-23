import { Module } from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { FavoritesController } from '../controllers/favorites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FavoritesController],
    providers: [FavoritesService],
    exports: [FavoritesService],
})
export class FavoritesModule {}
