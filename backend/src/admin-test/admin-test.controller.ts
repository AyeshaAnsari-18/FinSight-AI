/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { readFile } from 'fs/promises';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { AtGuard } from '../auth/guards/at.guard';
import { AdminTestService } from './admin-test.service';
import { AdminTestLoginDto } from './dto/admin-test-login.dto';
import { RunAdminTestDto } from './dto/run-admin-test.dto';
import { decryptBuffer } from '../common/security/data-protection';

@Controller('admin-test')
export class AdminTestController {
  constructor(private readonly adminTestService: AdminTestService) {}

  @Public()
  @Post('login')
  login(@Body() dto: AdminTestLoginDto) {
    return this.adminTestService.login(dto);
  }

  @UseGuards(AtGuard)
  @Get('catalog')
  getCatalog(@GetCurrentUser('role') role: string) {
    this.assertAdmin(role);
    return this.adminTestService.getCatalog();
  }

  @UseGuards(AtGuard)
  @Post('run')
  runTests(
    @Body() dto: RunAdminTestDto,
    @GetCurrentUser('role') role: string,
    @GetCurrentUser('email') email: string,
  ) {
    this.assertAdmin(role);
    return this.adminTestService.runTests(dto, email);
  }

  @UseGuards(AtGuard)
  @Get('reports')
  listReports(@GetCurrentUser('role') role: string) {
    this.assertAdmin(role);
    return this.adminTestService.listReports();
  }

  @UseGuards(AtGuard)
  @Get('reports/:id')
  getReport(@Param('id') id: string, @GetCurrentUser('role') role: string) {
    this.assertAdmin(role);
    return this.adminTestService.getReport(id);
  }

  @UseGuards(AtGuard)
  @Get('reports/:id/download')
  async downloadReport(
    @Param('id') id: string,
    @GetCurrentUser('role') role: string,
    @Res() res: Response,
  ) {
    this.assertAdmin(role);
    const file = await this.adminTestService.getReportFile(id);
    const encrypted = await readFile(file.filePath);
    const pdfBuffer = decryptBuffer(encrypted);
    res.status(200);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    return res.send(pdfBuffer);
  }

  private assertAdmin(role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can access the admin test console.');
    }
  }
}
