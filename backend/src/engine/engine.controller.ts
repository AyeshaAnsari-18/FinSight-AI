/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EngineService } from './engine.service';
import 'multer'

@Controller('engine')
export class EngineController {
    constructor(private readonly engineService: EngineService) {
    }

    @Post('upload-ocr')
    @UseInterceptors(FileInterceptor('document'))
    async uploadDocumentForOCR(@UploadedFile() file: Express.Multer.File) {
        return this.engineService.extractWithAI(file);
    }
}

