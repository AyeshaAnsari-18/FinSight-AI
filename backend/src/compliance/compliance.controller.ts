import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { ComplianceService } from './compliance.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('compliance')
@UseGuards(AtGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post()
  create(@Body() createComplianceDto: CreateComplianceDto) {
    return this.complianceService.create(createComplianceDto);
  }

  @Post('policies')
  createPolicy(@Body() createPolicyDto: import('./dto/create-policy.dto').CreatePolicyDto) {
    return this.complianceService.createPolicy(createPolicyDto);
  }

  @Get('issues')
  findAll() {
    return this.complianceService.findAllIssues();
  }

  @Get('controls')
  getControls() {
    return this.complianceService.getControls();
  }

  @Patch('controls/:id')
  updateControl(@Param('id') id: string, @Body() updateData: any) {
    return this.complianceService.updateControl(id, updateData);
  }

  @Post('controls/:id/evidence')
  @UseInterceptors(FileInterceptor('file'))
  uploadEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUser('sub') userId: string,
  ) {
    const dir = path.join(process.cwd(), 'uploads', 'evidence');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Remove existing file for this id if any
    const existing = fs.readdirSync(dir).find((f) => f.startsWith(id + '.'));
    if (existing) {
      fs.unlinkSync(path.join(dir, existing));
    }

    const ext = file.originalname.split('.').pop();
    const fileName = `${id}.${ext}`;
    fs.writeFileSync(path.join(dir, fileName), file.buffer);

    return this.complianceService.saveEvidenceMetadata(id, file.originalname, fileName, userId);
  }

  @Get('controls/:id/evidence/download')
  downloadEvidence(@Param('id') id: string, @Res() res: any) {
    const dir = path.join(process.cwd(), 'uploads', 'evidence');
    if (!fs.existsSync(dir)) throw new NotFoundException('No evidence found');

    const files = fs.readdirSync(dir);
    const file = files.find((f) => f.startsWith(id + '.'));

    if (!file) {
      throw new NotFoundException('Evidence file not found');
    }

    res.sendFile(path.join(dir, file));
  }

  @Get('reports/:id/download')
  downloadReport(@Param('id') id: string, @Res() res: any) {
    return this.complianceService.generateReportPdf(id, res);
  }

  @Get('policies')
  getPolicies() {
    return this.complianceService.getPolicies();
  }

  @Get('monitoring')
  getMonitoring() {
    return this.complianceService.getMonitoring();
  }
}
