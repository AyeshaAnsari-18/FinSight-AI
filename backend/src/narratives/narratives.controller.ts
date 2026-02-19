import { Controller, Get, UseGuards } from '@nestjs/common';
import { NarrativesService } from './narratives.service';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('narratives')
@UseGuards(AtGuard)
export class NarrativesController {
  constructor(private readonly narrativesService: NarrativesService) {}

  @Get()
  findAll() {
    return this.narrativesService.findAll();
  }
}
