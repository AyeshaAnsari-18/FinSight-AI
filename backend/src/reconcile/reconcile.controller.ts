import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReconcileService } from './reconcile.service';
import { AnalyzeReconcileDto } from './dto/analyze-reconcile.dto';
import { CreateReconcileDto } from './dto/create-reconcile.dto';
import { ReconcileReviewDto } from './dto/reconcile-review.dto';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('reconcile')
@UseGuards(AtGuard)
export class ReconcileController {
  constructor(private readonly reconcileService: ReconcileService) {}

  @Post()
  create(@Body() createReconcileDto: CreateReconcileDto) {
    return this.reconcileService.createAndAnalyze(createReconcileDto);
  }

  @Post('analyze')
  analyze(@Body() analyzeDto: AnalyzeReconcileDto) {
    return this.reconcileService.analyzePayload(analyzeDto);
  }

  @Post('review-summary')
  reviewSummary(@Body() reviewDto: ReconcileReviewDto) {
    return this.reconcileService.reviewSummary(reviewDto);
  }

  @Post(':id/analyze')
  analyzeOne(@Param('id') id: string) {
    return this.reconcileService.reanalyze(id);
  }

  @Get()
  findAll() {
    return this.reconcileService.findAll();
  }
}
