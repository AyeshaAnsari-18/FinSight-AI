import { Controller, Post, UseGuards } from '@nestjs/common';
import { FiscalService } from './fiscal.service';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('fiscal')
@UseGuards(AtGuard)
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post('run-close')
  runClose() {
    return this.fiscalService.runFiscalCloseAnalysis();
  }
}
