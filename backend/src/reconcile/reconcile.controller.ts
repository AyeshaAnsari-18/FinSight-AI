import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReconcileService } from './reconcile.service';
import { CreateReconcileDto } from './dto/create-reconcile.dto';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('reconcile')
@UseGuards(AtGuard)
export class ReconcileController {
  constructor(private readonly reconcileService: ReconcileService) {}

  @Post()
  create(@Body() createReconcileDto: CreateReconcileDto) {
    return this.reconcileService.createAndAnalyze(createReconcileDto);
  }

  @Get()
  findAll() {
    return this.reconcileService.findAll();
  }
}
