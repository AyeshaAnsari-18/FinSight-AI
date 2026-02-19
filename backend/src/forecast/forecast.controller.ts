import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ForecastService } from './forecast.service';
import { AtGuard } from '../auth/guards/at.guard';
import { ForecastQueryDto } from './dto/forecast-query.dto';

@Controller('forecast')
@UseGuards(AtGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('predict')
  getForecast(@Query() query: ForecastQueryDto) {
    return this.forecastService.generateForecast(query.force === 'true');
  }

  @Get('what-if')
  getWhatIf(@Query() query: ForecastQueryDto) {
    return this.forecastService.generateWhatIf(query.force === 'true');
  }
}
