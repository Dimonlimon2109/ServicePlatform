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
  HttpCode, Put
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';
import {RolesGuard} from "../guards/roles.guard";
import {Roles} from "../decorators/roles.decorator";
import {Role} from "../enums/role.enum";

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, description: 'Возвращает всех пользователей.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.usersService.findAll();
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
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
      @Request() req,
  ) {
    // Разрешить пользователям обновлять только свой профиль, если они не администраторы
    if (req.user.id !== id) {
      return { message: 'Вы можете обновлять только свой собственный профиль.' };
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiParam({ name: 'id', description: 'Идентификатор пользователя для удаления' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удалён.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещён.' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден.' })
  remove(@Param('id') id: string, @Request() req) {
    // Разрешить пользователям удалять только свой профиль, если они не администраторы
    if (req.user.id !== id) {
      return { message: 'Вы можете удалять только свой собственный профиль.' };
    }
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
