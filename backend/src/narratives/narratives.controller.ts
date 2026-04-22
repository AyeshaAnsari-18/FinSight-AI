import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { NarrativesService } from './narratives.service';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { Response } from 'express';

@Controller('narratives')
@UseGuards(AtGuard)
export class NarrativesController {
  constructor(private readonly narrativesService: NarrativesService) {}

  private pipePdf(res: Response, filePath: string, fileName: string) {
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500);
      }
      res.end();
    });
    stream.pipe(res);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.narrativesService.findAll(search);
  }

  @Post()
  @UseInterceptors(FileInterceptor('document'))
  create(
    @GetCurrentUser('sub') userId: string,
    @Body() payload: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.narrativesService.createReport(userId, payload, file);
  }

  @Public()
  @Get(':id/report')
  async report(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.narrativesService.getReportById(id);
    const filePath = await this.narrativesService.getReportFilePath(id).catch(() => null);

    if (!filePath) {
      throw new NotFoundException('Generated report file not found.');
    }

    this.pipePdf(res, filePath, `${report.fileName}.pdf`);
  }

  @Public()
  @Get(':id/invoice')
  async invoice(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.narrativesService.getReportById(id);
    const filePath = await this.narrativesService.getInvoiceFilePath(id).catch(() => null);

    if (filePath) {
      this.pipePdf(res, filePath, `${report.fileName}-invoice.pdf`);
      return;
    }

    if (report.fileUrl.startsWith('http://') || report.fileUrl.startsWith('https://')) {
      res.redirect(report.fileUrl);
      return;
    }

    if (report.fileUrl.startsWith('/')) {
      res.redirect(report.fileUrl);
      return;
    }

    throw new NotFoundException('Stored invoice file not found.');
  }

  @Public()
  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.report(id, res);
  }
}
