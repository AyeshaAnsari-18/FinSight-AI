import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplianceDto } from './dto/create-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateComplianceDto) {
    return this.prisma.riskControl.create({
      data: {
        riskName: dto.riskName,
        controlDesc: dto.controlDesc,
        status: dto.status,
        lastTested: dto.lastTested ? new Date(dto.lastTested) : null,
      },
    });
  }

  async findAllIssues() {
    const risks = await this.prisma.riskControl.findMany({
      orderBy: { id: 'desc' },
    });

    return risks.map((risk) => ({
      id: risk.id.substring(0, 8).toUpperCase(),
      issue: risk.riskName,
      dept: 'Enterprise',
      status: risk.status || 'Open',
    }));
  }
}
