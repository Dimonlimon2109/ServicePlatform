import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class UploadService {
  getStorage() {
    return diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const uniqueName = `${uniqueSuffix}${extname(file.originalname)}`;
        callback(null, uniqueName);
      },
    });
  }

  getImagePath(file: Express.Multer.File): string {
    return file?.filename ? `uploads/${file.filename}` : null;
  }
}
