/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EngineService } from './engine.service';
import 'multer'

@Controller('engine')
export class EngineController {
    constructor(private readonly engineService: EngineService) {
    }

    @Post('analyze-journal')
    async analyzeJournal(@Body() payload: any) {
        return this.engineService.analyzeJournal(payload);
    }

    @Post('analyze-reconciliation')
    async analyzeReconciliation(@Body() payload: any) {
        return this.engineService.analyzeReconciliation(payload);
    }

    @Post('orchestrate-fiscal-close')
    async orchestrateFiscalClose(@Body() payload: any) {
        return this.engineService.orchestrateFiscalClose(payload);
    }

    @Post('predict-forecast')
    async predictForecast(@Body() payload: any) {
        return this.engineService.predictForecast(payload);
    }

    @Post('predict-what-if')
    async predictWhatIf(@Body() payload: any) {
        return this.engineService.predictWhatIf(payload);
    }

    @Post('copilot-rag')
    async runCopilotRag(@Body() payload: any) {
        return this.engineService.runCopilotRag(payload);
    }

    @Post('upload-ocr')
    @UseInterceptors(FileInterceptor('document'))
    async uploadDocumentForOCR(@UploadedFile() file: Express.Multer.File) {
        return this.engineService.extractWithAI(file);
    }
}

 
