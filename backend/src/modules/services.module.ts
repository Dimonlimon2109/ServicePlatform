import { Module } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { ServicesController } from '../controllers/services.controller';
import { PrismaModule } from '../prisma/prisma.module';
import {UploadModule} from "./upload.module";

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
