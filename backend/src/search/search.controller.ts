import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(AtGuard)
  @Get()
  async globalSearch(@Query('q') q: string) {
    return this.searchService.globalSearch(q || '');
  }
}
