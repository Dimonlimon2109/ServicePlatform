import { Module } from '@nestjs/common';
import { JwtTokenService } from '../services/jwt-token.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [JwtTokenService],
  exports: [JwtTokenService],
  imports: [JwtModule, PrismaModule],
})
export class JwtTokenModule {}