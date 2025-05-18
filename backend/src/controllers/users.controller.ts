import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode, Put, Query, UseInterceptors, UploadedFile, ForbiddenException
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody} from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";
import {Role} from "../enums/role.enum";
import {UserFiltersDto} from "../dto/user-filters.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {UploadService} from "../services/upload.service";
import {ChangePasswordDto} from "../dto/change-password.dto";

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
  private readonly uploadService: UploadService) {}


  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiOperation({ summary: 'Получить всех пользователей с пагинацией и фильтрацией' })
  @ApiResponse({ status: 200, description: 'Список пользователей.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
      @Query() filters: UserFiltersDto,
  ) {
    const page = parseInt(filters.page ?? '1', 10);
    const limit = parseInt(filters.limit ?? '10', 10);
    return this.usersService.findAll(Number(page), Number(limit), filters);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя' })
  @ApiResponse({ status: 200, description: 'Возвращает пользователя.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Возвращает профиль текущего пользователя.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  findMyProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: new UploadService().getStorage(), // Можно заменить на провайдер
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя для обновления' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно обновлён.' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  update(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
      @UploadedFile() avatar: Express.Multer.File,
      @Request() req,
  ) {
    if(avatar != null){
      updateUserDto.profilePhotoPath = this.uploadService.getImagePath(avatar);
    }
    // Разрешить пользователям обновлять только свой профиль, если они не администраторы
    if (req.user.id !== id) {
      return { message: 'Вы можете обновлять только свой собственный профиль.' };
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Change user password',
    description: 'Requires current password verification. Available for account owner.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя',
    example: '3aa8b6a9-7d7c-4c1f-b3a3-4e99c0e6e4e9',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Пароль успешно обновлён.' })
  @ApiResponse({
    status: 400,
    description: 'Некорректные входные данные',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Только пользователь может менять свой пароль',
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
  })
  async changePassword(
      @Param('id') id: string,
      @Body() changePasswordDto: ChangePasswordDto,
      @Request() req,
  ) {
    // Проверка прав доступа
    if (req.user.id !== id) {
      throw new ForbiddenException(
          'Только пользователь может менять свой пароль',
      );
    }

    return this.usersService.changePassword(
        id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя для удаления' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удалён.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  remove(@Param('id') id: string, @Request() req) {
    // Разрешить пользователям удалять только свой профиль, если они не администраторы
    return this.usersService.remove(id);
  }


  @Put(':id/block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Заблокировать пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь заблокирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  blockUser(@Param('id') id: string) {
    return this.usersService.toggleBlockUser(id, true);
  }

  @Put(':id/unblock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Разблокировать пользователя' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь разблокирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  unblockUser(@Param('id') id: string) {
    return this.usersService.toggleBlockUser(id, false);
  }

}
