import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as ms from 'ms';

import { Role } from '../enums/role.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import {Tokens} from '../interfaces/tokens.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma : PrismaService
  ) {}

  async generateTokens(userId: string, email: string, userType: Role.User | Role.Admin): Promise<Tokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      userType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async getUserIdFromAccessToken(token: string): Promise<string> {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      return decoded.sub;
    } catch (error) {
      throw new UnauthorizedException('Недействительный access токен');
    }
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d';
    const expiresAt = new Date(Date.now() + ms(refreshExpiration as ms.StringValue));

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedRefreshToken,
        expiresAt,
      },
    });
  }
}
