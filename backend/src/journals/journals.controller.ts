/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { AnalyzeJournalDto } from './dto/analyze-journal.dto';
import { JournalReviewDto } from './dto/journal-review.dto';

@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalsService.create(createJournalDto);
  }

  @Get()
  findAll() {
    return this.journalsService.findAll();
  }

  @Post('review-summary')
  reviewSummary(@Body() reviewDto: JournalReviewDto) {
    return this.journalsService.reviewSummary(reviewDto);
  }

  @Post('analyze')
  analyze(@Body() analyzeDto: AnalyzeJournalDto) {
    return this.journalsService.analyzeDraft(analyzeDto);
  }

  @Post(':id/analyze')
  analyzeOne(@Param('id') id: string) {
    return this.journalsService.reanalyze(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJournalDto: UpdateJournalDto) {
    return this.journalsService.update(id, updateJournalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.journalsService.remove(id);
  }
}
