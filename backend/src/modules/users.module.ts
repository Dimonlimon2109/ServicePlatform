import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import {UploadModule} from "./upload.module";

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
