import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import {extname, join} from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as process from "node:process";

@Injectable()
export class UploadService {
  private uploadDir = __dirname.includes('dist')
      ? join(__dirname, '..', 'uploads')
      : join(__dirname, '..', 'uploads');

  getStorage() {
    return diskStorage({
      destination: this.uploadDir,
      filename: async (req, file, callback) => {
        console.log(this.uploadDir);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${uniqueSuffix}${extname(file.originalname)}`;
        console.log('Название файла при сохранении: ' + filename);
        callback(null, filename);
      },
    });
  }

  async resizeImage(file: Express.Multer.File): Promise<void> {
    const filePath = path.join(this.uploadDir, file.filename);
    const resizedPath = path.join(this.uploadDir, `resized-${file.filename}`);

    await sharp(filePath)
        .resize(300, 300, { fit: 'cover' }) // квадратное изображение
        .toFile(resizedPath);

    // Заменить оригинал на уменьшенную версию
    fs.unlinkSync(filePath);
    fs.renameSync(resizedPath, filePath);
  }

  getImagePath(file: Express.Multer.File): string {
    console.log('Получение пути из getImagePath: ' + file.filename);
    console.log(file.filename);
    return file?.filename ? `/uploads/${file.filename}` : null;
  }
  getDefaultImagePath(): string {
    return '/uploads/default/default-image.png';
  }
}
