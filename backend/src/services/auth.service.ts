  import { Injectable,
     UnauthorizedException,
      ConflictException,
       NotFoundException,
        BadRequestException
       } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import * as bcrypt from 'bcrypt';
  import { RegisterDto } from '../dto/register.dto';
  import { LoginDto } from '../dto/login.dto';
  import { Tokens } from '../interfaces/tokens.interface';
  import { User } from '@prisma/client';
  import { Role } from '../enums/role.enum';
  import { JwtTokenService } from './jwt-token.service';
  import { UploadService } from './upload.service';
  import {JwtPayload} from "../interfaces/jwt-payload.interface";

  @Injectable()
  export class AuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly jwtTokensService: JwtTokenService
      ) {}

    async register(registerDto: RegisterDto, imagePath: string): Promise<Tokens> {
      const { email, password, firstName, lastName, phone } = registerDto;
      const userExists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        throw new ConflictException('Email уже используется');
      }

      const hashedPassword = await this.hashPassword(password);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          userType: Role.User,
          profilePhotoPath : imagePath
        },
      });
      const tokens = await this.jwtTokensService.generateTokens(user.id, user.email, user.userType as Role);
      await this.jwtTokensService.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    }

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user.isBlocked) {
        throw new UnauthorizedException('Пользователь заблокирован');
      }

      if (await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      else{
        throw new NotFoundException('Неверный email или пароль');
      }
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: Omit<User, 'password'> }> {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      const tokens = await this.jwtTokensService.generateTokens(user.id, user.email, user.userType as Role);
      await this.jwtTokensService.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    }

    async refreshTokens(refreshToken: string): Promise<Tokens> {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token отсутствует');
      }

      // Верифицируем токен и получаем payload
      let payload: JwtPayload;
      try {
        payload = await this.jwtTokensService.verifyRefreshToken(refreshToken);
      } catch (error) {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Находим пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      console.log(user);

      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Находим все активные refresh токены пользователя
      const tokenEntities = await this.prisma.refreshToken.findMany({
        where: {
          userId: user.id,
          expiresAt: { gt: new Date() },
        },
      });
      console.log(tokenEntities);

      // Проверяем совпадение токена
      let isTokenValid = false;
      for (const tokenEntity of tokenEntities) {
        if (await bcrypt.compare(refreshToken, tokenEntity.token)) {
          isTokenValid = true;

          // Безопасное удаление с проверкой существования
          await this.prisma.refreshToken.deleteMany({
            where: {
              id: tokenEntity.id,
              userId: user.id // Добавляем дополнительную проверку
            }
          });
          break;
        }
      }

      if (!isTokenValid) {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Генерация новых токенов
      const tokens = await this.jwtTokensService.generateTokens(
          user.id,
          user.email,
          user.userType as Role
      );

      // Сохраняем новый refresh токен
      await this.jwtTokensService.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    }

    async logout(accessToken: string): Promise<{ message: string }> {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: await this.jwtTokensService.getUserIdFromAccessToken(accessToken),
        },
      });

      return { message: 'Успешный выход из аккаунта' };
    }

    private async hashPassword(password:string):Promise<string>{
      return await bcrypt.hash(password, 10);
    }
  }
