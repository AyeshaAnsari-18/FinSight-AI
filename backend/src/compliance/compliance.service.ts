import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptText, encryptText } from '../common/security/data-protection';
import { CreateComplianceDto } from './dto/create-compliance.dto';

import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

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

  async createPolicy(dto: import('./dto/create-policy.dto').CreatePolicyDto) {
    return this.prisma.policy.create({
      data: {
        title: encryptText(dto.title),
        category: encryptText(dto.category),
        content: encryptText(dto.content),
      },
    });
  }

  async findAllIssues() {
    return this.getControls();
  }

  async saveEvidenceMetadata(id: string, originalName: string, fileName: string, userId: string) {
    const url = `/compliance/controls/${id}/evidence/download`;
    
    let doc = await this.prisma.document.findFirst({
      where: { fileUrl: url }
    });

    if (doc) {
      doc = await this.prisma.document.update({
        where: { id: doc.id },
        data: {
          fileName: originalName,
          uploadedById: userId,
          createdAt: new Date(),
        }
      });
    } else {
      doc = await this.prisma.document.create({
        data: {
          fileName: originalName,
          fileUrl: url,
          fileType: 'application/pdf',
          uploadedById: userId,
        }
      });
    }
    
    return { url, fileName: originalName };
  }

  async getControls() {
    const risks = await this.prisma.riskControl.findMany({
      orderBy: { id: 'desc' },
    });

    const dir = path.join(process.cwd(), 'uploads', 'evidence');
    let existingFiles: string[] = [];
    if (fs.existsSync(dir)) {
      existingFiles = fs.readdirSync(dir);
    }

    const docs = await this.prisma.document.findMany({
      where: { fileUrl: { startsWith: '/compliance/controls/' } },
      include: { uploadedBy: true }
    });

    return risks.map((r) => {
      const shortId = r.id.substring(0, 8).toUpperCase();
      const file = existingFiles.find((f) => f.startsWith(shortId + '.'));
      const doc = docs.find(d => d.fileUrl.includes(shortId));
      
      return {
        id: shortId,
        control: decryptText(r.riskName) || '',
        desc: decryptText(r.controlDesc) || '',
        status: r.status,
        tested: r.lastTested
          ? r.lastTested.toISOString().split('T')[0]
          : 'Not tested',
        documentUrl: file
          ? `/compliance/controls/${shortId}/evidence/download`
          : null,
        documentName: doc ? doc.fileName : (file ? file : null),
        uploadedBy: doc ? (doc.uploadedBy.name || doc.uploadedBy.email) : 'N/A',
        uploadDate: doc ? doc.createdAt.toISOString().split('T')[0] : (r.lastTested ? r.lastTested.toISOString().split('T')[0] : 'N/A'),
      };
    });
  }

  async updateControl(id: string, data: any) {
    // We map short id to the real DB id by finding it
    const allControls = await this.prisma.riskControl.findMany();
    const control = allControls.find(c => c.id.substring(0, 8).toUpperCase() === id.toUpperCase());
    
    if (!control) {
      throw new NotFoundException('Control not found');
    }

    return this.prisma.riskControl.update({
      where: { id: control.id },
      data: {
        status: data.status,
        lastTested: new Date()
      }
    });
  }

  async generateReportPdf(id: string, res: any) {
    const policyId = id.replace('REP-', '');
    // Try to find the policy by matching the start of the ID
    const policies = await this.prisma.policy.findMany();
    const policy = policies.find(p => p.id.toUpperCase().startsWith(policyId));

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Compliance_Report_${id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Compliance Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`Report ID: ${id}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown();

    if (policy) {
      doc.fontSize(16).text('Policy Information', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Title: ${decryptText(policy.title) || 'N/A'}`);
      doc.text(`Category: ${decryptText(policy.category) || 'N/A'}`);
      doc.moveDown();
      doc.text(decryptText(policy.content) || 'No content provided.');
    } else {
      doc.fontSize(12).text('Policy details could not be found for this report ID.');
    }

    doc.end();
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
    const flaggedJournals = await this.prisma.journalEntry.count({
      where: { status: 'FLAGGED' },
    });

    let defaultDepts = groupedRoles.map(
      (g) => g.role.charAt(0) + g.role.slice(1).toLowerCase(),
    );
    if (defaultDepts.length === 0)
      defaultDepts = ['Finance', 'HR', 'Operations'];

    return defaultDepts.map((dept, i) => ({
      department: dept,
      issues: Math.floor(flaggedJournals / defaultDepts.length) + (i % 3),
    }));
  }
}
