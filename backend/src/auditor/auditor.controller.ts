import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditorService } from './auditor.service';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('auditor')
@UseGuards(AtGuard)
export class AuditorController {
  constructor(private readonly auditorService: AuditorService) {}

  @Get('dashboard')
  getDashboardMetrics() {
    return this.auditorService.getDashboardMetrics();
  }

  @Get('compliance')
  getComplianceChecks() {
    return this.auditorService.getComplianceData();
  }

  @Get('department-overview')
  getDepartmentOverview() {
    return this.auditorService.getDepartmentOverview();
  }
}
