import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { AtGuard } from '../auth/guards/at.guard';

@Controller('compliance')
@UseGuards(AtGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  create(@Body() createComplianceDto: CreateComplianceDto) {
    return this.complianceService.create(createComplianceDto);
  }

  @Get('issues')
  findAll() {
    return this.complianceService.findAllIssues();
  }
}
