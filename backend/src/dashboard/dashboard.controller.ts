import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('dashboard')
@UseGuards(AtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('accountant')
  getAccountantStats(@GetCurrentUser('sub') userId: string) {
    return this.dashboardService.getAccountantMetrics(userId);
  }
}
