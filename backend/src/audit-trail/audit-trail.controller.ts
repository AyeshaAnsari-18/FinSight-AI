/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuditTrailService } from './audit-trail.service';
import { CreateAuditTrailDto } from './dto/create-audit-trail.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('audit-trail')
@UseGuards(AtGuard) 
export class AuditTrailController {
  constructor(private readonly auditTrailService: AuditTrailService) {}

  @Post()
  create(@Body() createAuditTrailDto: CreateAuditTrailDto, @GetCurrentUser('sub') userId: string) {
    createAuditTrailDto.userId = userId;
    return this.auditTrailService.create(createAuditTrailDto);
  }

  @Get()
  findAll() {
    return this.auditTrailService.findAll();
  }
}
