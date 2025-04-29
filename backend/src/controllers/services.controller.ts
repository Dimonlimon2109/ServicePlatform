import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiConsumes} from '@nestjs/swagger';
import {UploadService} from "../services/upload.service";
import {FileInterceptor} from "@nestjs/platform-express";
import {CreateServiceDto} from "../dto/create-service.dto";
import {UpdateServiceDto} from "../dto/update-service.dto";

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService,
              private  readonly  uploadService: UploadService,) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  @UseInterceptors(FileInterceptor('photo', {
    storage: new UploadService().getStorage(), // Лучше использовать через провайдер
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Создать новую услугу' })
  @ApiResponse({ status: 201, description: 'Услуга успешно создана.' })
  @ApiBody({
    description: 'Данные новой услуги',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Муж на час' },
        description: { type: 'string', example: 'Услуги мужа на час: проверка сантехники, электрики и т.д.' },
        price: { type: 'number', example: 35.5 },
        category: { type: 'string', example: 'Ремонт' },
        duration: { type: 'integer', example: 60 },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'price', 'category', 'duration', 'photo'],
    }
  })
  async create(
      @UploadedFile() photo: Express.Multer.File,
      @Body() createServiceDto: CreateServiceDto,
      @Request() req,
  ): Promise<any> {
    console.log('PHOTO:', photo);
    console.log('BODY:', createServiceDto);
    console.log('USER:', req.user);
    const photoPath = this.uploadService.getImagePath(photo);
    return this.servicesService.create({
      ...createServiceDto,
      photoPath,
      providerId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Получить все услуги' })
  @ApiResponse({ status: 200, description: 'Все доступные услуги.' })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить услугу по ID' })
  @ApiParam({ name: 'id', description: 'ID услуги', type: 'string' })
  @ApiResponse({ status: 200, description: 'Информация об услуге.' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('provider/me')
  @ApiOperation({ summary: 'Получить услуги текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Услуги текущего провайдера.' })
  findMyServices(@Request() req) {
    return this.servicesService.findByProvider(req.user.id);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Получить услуги по категории' })
  @ApiParam({ name: 'category', description: 'Категория услуги', type: 'string' })
  @ApiResponse({ status: 200, description: 'Услуги указанной категории.' })
  findByCategory(@Param('category') category: string) {
    return this.servicesService.findByCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', {
    storage: new UploadService().getStorage(),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Обновить услугу' })
  @ApiParam({ name: 'id', description: 'ID услуги для обновления', type: 'string' })
  @ApiResponse({ status: 200, description: 'Услуга успешно обновлена.' })
  @ApiBody({
    description: 'Данные для обновления услуги',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        price: { type: 'number', nullable: true },
        category: { type: 'string', nullable: true },
        duration: { type: 'integer', nullable: true },
        photo: { type: 'string', format: 'binary', nullable: true },
      },
    }
  })
  async update(
      @Param('id') id: string,
      @UploadedFile() photo: Express.Multer.File,
      @Body() updateServiceDto: UpdateServiceDto,
      @Request() req,
  ): Promise<any> {
    const photoPath = this.uploadService.getImagePath(photo);
    return this.servicesService.update(
        id,
        {
          ...updateServiceDto,
          photoPath,
        },
        req.user.id,
    );
  }


  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить услугу' })
  @ApiParam({ name: 'id', description: 'ID услуги для удаления', type: 'string' })
  @ApiResponse({ status: 200, description: 'Услуга успешно удалена.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.id);
  }
}
