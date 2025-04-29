import { 
  Controller,
  Post,
  Body,
  UseGuards, 
  Req, 
  HttpCode, 
  HttpStatus, 
  BadRequestException, 
  NotFoundException,
  UploadedFile,
  UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Tokens } from '../interfaces/tokens.interface';
import { UploadService } from '../services/upload.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private readonly uploadService: UploadService
  ) {}

  @Post('register')
@HttpCode(HttpStatus.CREATED)
@UseInterceptors(FileInterceptor('avatar', {
  storage: new UploadService().getStorage(), // Можно заменить на провайдер
}))
@ApiOperation({ summary: 'Регистрация нового пользователя' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'Форма регистрации',
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      phone: { type: 'string' },
      avatar: { type: 'string', format: 'binary' },
    },
  },
})
@ApiResponse({
  status: 201,
  description: 'Пользователь успешно зарегистрирован',
  schema: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
    },
  },
})
@ApiResponse({ status: 409, description: 'Email уже используется' })
async register(
  @Body() registerDto: RegisterDto,
  @UploadedFile() avatar: Express.Multer.File,
): Promise<Tokens> {
  const imagePath:string = this.uploadService.getImagePath(avatar);
  return this.authService.register(registerDto, imagePath);
}

  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешный вход',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный пароль',
    type: BadRequestException,
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
    type: NotFoundException,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<Tokens> {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Обновление access/refresh токенов по refresh токену' })
  @ApiBody({
    description: 'Refresh токен, выданный ранее при аутентификации',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'новый_access_token',
        },
        refreshToken: {
          type: 'string',
          example: 'новый_refresh_token',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token отсутствует или недействителен' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body('refreshToken') refreshToken: string): Promise<Tokens> {
    return this.authService.refreshTokens(refreshToken);
  }

@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Выход пользователя из аккаунта' })
@ApiResponse({
  status: 200,
  description: 'Успешный выход из аккаунта',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Logged out successfully' },
    },
  },
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Post('logout')
@HttpCode(HttpStatus.OK)
async logout(@Req() req: Request): Promise<{ message: string }> {
  const authHeader = req.headers['authorization'];
  const accessToken = authHeader?.replace('Bearer ', '');
  console.log(req);
  return this.authService.logout(accessToken);
}

} 