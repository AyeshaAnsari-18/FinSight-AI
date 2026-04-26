import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptText, encryptText } from '../common/security/data-protection';
import { CreateComplianceDto } from './dto/create-compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateComplianceDto) {
    return this.prisma.riskControl.create({
      data: {
        riskName: encryptText(dto.riskName),
        controlDesc: encryptText(dto.controlDesc),
        status: dto.status,
        lastTested: dto.lastTested ? new Date(dto.lastTested) : null,
      },
    });
  }

  async findAllIssues() {
    return this.getControls();
  }

  async getControls() {
    const risks = await this.prisma.riskControl.findMany({
      orderBy: { id: 'desc' },
    });
    return risks.map((r) => ({
      id: r.id.substring(0, 8).toUpperCase(),
      control: decryptText(r.riskName) || '',
      desc: decryptText(r.controlDesc) || '',
      status: r.status,
      tested: r.lastTested ? r.lastTested.toISOString().split('T')[0] : 'Not tested',
    }));
  }

  async getPolicies() {
    const policies = await this.prisma.policy.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return policies.map((policy) => ({
      ...policy,
      title: decryptText(policy.title) || '',
      content: decryptText(policy.content) || '',
      category: decryptText(policy.category) || policy.category,
    }));
  }

  async getMonitoring() {
    const groupedRoles = await this.prisma.user.groupBy({ by: ['role'] });
    const flaggedJournals = await this.prisma.journalEntry.count({ where: { status: 'FLAGGED' }});
    
    let defaultDepts = groupedRoles.map(g => g.role.charAt(0) + g.role.slice(1).toLowerCase());
    if (defaultDepts.length === 0) defaultDepts = ["Finance", "HR", "Operations"];

    return defaultDepts.map((dept, i) => ({
      department: dept,
      issues: Math.floor(flaggedJournals / (defaultDepts.length)) + (i % 3),
    }));
  }
}
