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

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
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

    // Generate tokens
    const tokens = await this.jwtTokensService.generateTokens(user.id, user.email, user.userType as Role);
    await this.jwtTokensService.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if(!user)
    {
      throw new NotFoundException('Пользователя с данным email не существует');
    }

    if (await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    else{
      throw new BadRequestException('Неверный пароль');
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

  async refreshTokens(refreshToken : string): Promise<Tokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token отсутствует');
    }

    const users = await this.prisma.user.findMany({
      include: {
        refreshTokens: true,
      },
    });
    const user = users.find((u) =>
      u.refreshTokens.some(
        (rt) => rt.expiresAt > new Date() && bcrypt.compareSync(refreshToken, rt.token)
      )
    );

    if (!user || !user.refreshTokens.length) {
      throw new UnauthorizedException('Доступ отклонен');
    }

    const tokens = await this.jwtTokensService.generateTokens(user.id, user.email, user.userType as Role);
    await this.jwtTokensService.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: await this.jwtTokensService.getUserIdFromAccessToken(accessToken),
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async hashPassword(password:string):Promise<string>{
    return await bcrypt.hash(password, 10);
  }
}
