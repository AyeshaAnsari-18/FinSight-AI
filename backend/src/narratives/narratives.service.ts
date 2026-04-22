/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { finished } from 'stream/promises';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';

type NarrativeReportRecord = {
  id: string;
  fileName: string;
  fileUrl: string;
  generatedFileUrl: string | null;
  fileType: string;
  extractedText: string | null;
  summary: string | null;
  createdAt: Date;
  uploadedBy?: {
    name: string | null;
    email: string;
  } | null;
  invoiceAvailable?: boolean;
  reportAvailable?: boolean;
};

type CreateNarrativeReportInput = {
  title?: string;
  summary?: string;
  extractedText?: string;
  fileType?: string;
  fileUrl?: string;
};

type NormalizedNarrativeReport = {
  recordId: string;
  id: string;
  title: string;
  author: string;
  period: string;
  content: string;
  createdAt: string;
  status: string;
  fileType: string;
  invoiceUrl: string;
  reportUrl: string;
  downloadUrl: string;
  invoiceAvailable: boolean;
  reportAvailable: boolean;
};

@Injectable()
export class NarrativesService {
  constructor(private prisma: PrismaService) {}

  private getStorageDirectory() {
    return join(process.cwd(), 'storage', 'documents');
  }

  private getPublicBaseUrl() {
    return (
      process.env.API_PUBLIC_URL ||
      process.env.BACKEND_PUBLIC_URL ||
      process.env.APP_URL ||
      'http://localhost:3000'
    );
  }

  private getInvoicePath(id: string) {
    return join(this.getStorageDirectory(), `invoice-${id}.pdf`);
  }

  private getReportPath(id: string) {
    return join(this.getStorageDirectory(), `report-${id}.pdf`);
  }

  private buildInvoiceUrl(id: string) {
    return `${this.getPublicBaseUrl()}/narratives/${id}/invoice`;
  }

  private buildReportUrl(id: string) {
    return `${this.getPublicBaseUrl()}/narratives/${id}/report`;
  }

  private async ensureStorageDirectory() {
    await mkdir(this.getStorageDirectory(), { recursive: true });
  }

  private async fileExists(filePath: string) {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async findInvoiceFilePath(id: string) {
    const currentPath = this.getInvoicePath(id);
    if (await this.fileExists(currentPath)) {
      return currentPath;
    }

    const legacyFiles = await import('fs/promises').then(({ readdir }) =>
      readdir(this.getStorageDirectory()).catch(() => [] as string[]),
    );
    const legacyMatch = legacyFiles.find((name) => name.startsWith(`${id}-`));
    if (!legacyMatch) {
      return null;
    }

    return join(this.getStorageDirectory(), legacyMatch);
  }

  private summarizeText(text: string, maxLength = 180) {
    return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
  }

  private async writeReportPdf(filePath: string, report: NarrativeReportRecord) {
    await this.ensureStorageDirectory();

    const generatedAt = new Date();
    const doc = new PDFDocument({
      size: 'A4',
      margin: 48,
      bufferPages: true,
    });
    const stream = createWriteStream(filePath);

    doc.pipe(stream);

    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(24)
      .text('FinSight AI Generated Report', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fillColor('#475569')
      .font('Helvetica')
      .fontSize(10)
      .text(`Report ID: ${report.id}`, { align: 'center' });
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, { align: 'center' });

    doc.moveDown(1.2);
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(report.fileName);

    doc.moveDown(0.5);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#334155')
      .text(
        `Author: ${report.uploadedBy?.name || report.uploadedBy?.email || 'System Generated'}`,
      );
    doc.text(`File type: ${report.fileType}`);
    doc.text(`Status: ${report.summary || report.extractedText ? 'Completed' : 'Draft'}`);

    doc.moveDown(1);
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Executive Summary');
    doc.moveDown(0.4);
    doc
      .fillColor('#1e293b')
      .font('Helvetica')
      .fontSize(11)
      .lineGap(4)
      .text(report.summary || 'No summary available yet.', {
        width: 500,
      });

    doc.moveDown(1);
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Extracted Text');
    doc.moveDown(0.4);
    doc
      .fillColor('#1e293b')
      .font('Helvetica')
      .fontSize(10.5)
      .lineGap(4)
      .text(report.extractedText || 'No extracted text available.', {
        width: 500,
      });

    doc.moveDown(1);
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('Source');
    doc.moveDown(0.4);
    doc
      .fillColor('#1e293b')
      .font('Helvetica')
      .fontSize(10.5)
      .lineGap(4)
      .text(`Invoice link: ${report.fileUrl}`);

    doc.end();
    await finished(stream);
  }

  private normalizeReport(report: NarrativeReportRecord): NormalizedNarrativeReport {
    const createdAt = new Date(report.createdAt);
    const previewSource = report.summary || report.extractedText || '';
    const content =
      previewSource.length > 180
        ? `${previewSource.slice(0, 180).trimEnd()}...`
        : previewSource || 'No summary available yet.';
    const invoiceUrl = report.fileUrl;
    const reportUrl = report.generatedFileUrl || '';
    const invoiceAvailable = Boolean(report.invoiceAvailable);
    const reportAvailable = Boolean(report.reportAvailable);

    return {
      recordId: report.id,
      id: report.id.substring(0, 8).toUpperCase(),
      title: report.fileName,
      author: report.uploadedBy?.name || report.uploadedBy?.email || 'System Generated',
      period: createdAt.toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      }),
      content,
      createdAt: createdAt.toISOString(),
      status: report.summary || report.extractedText ? 'Completed' : 'Draft',
      fileType: report.fileType,
      invoiceUrl,
      reportUrl,
      downloadUrl: reportUrl,
      invoiceAvailable,
      reportAvailable,
    };
  }

  private async ensureGeneratedReport(report: NarrativeReportRecord) {
    if (!report.summary && !report.extractedText) {
      return report;
    }

    const reportPath = this.getReportPath(report.id);
    const reportUrl = this.buildReportUrl(report.id);
    const reportAvailable = await this.fileExists(reportPath);

    if (!reportAvailable) {
      await this.writeReportPdf(reportPath, report);
    }

    if (report.generatedFileUrl !== reportUrl) {
      const updated = await this.prisma.document.update({
        where: { id: report.id },
        data: { generatedFileUrl: reportUrl },
        include: { uploadedBy: true },
      });

      return updated as NarrativeReportRecord;
    }

    return report;
  }

  async findAll(search?: string) {
    const query = search?.trim();

    const reports = (await this.prisma.document.findMany({
      where: query
        ? {
            OR: [
              { fileName: { contains: query, mode: 'insensitive' } },
              { fileType: { contains: query, mode: 'insensitive' } },
              { summary: { contains: query, mode: 'insensitive' } },
              { extractedText: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { uploadedBy: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })) as NarrativeReportRecord[];

    const materializedReports = await Promise.all(
      reports.map(async (report) => {
        const enriched = await this.ensureGeneratedReport(report);
        const invoicePath = await this.findInvoiceFilePath(enriched.id);
        const reportPath = this.getReportPath(enriched.id);
        return {
          ...enriched,
          invoiceAvailable: Boolean(invoicePath),
          reportAvailable: await this.fileExists(reportPath),
        } as NarrativeReportRecord & {
          invoiceAvailable: boolean;
          reportAvailable: boolean;
        };
      }),
    );

    return materializedReports.map((report) => this.normalizeReport(report));
  }

  async createReport(
    userId: string,
    payload: CreateNarrativeReportInput,
    file?: Express.Multer.File,
  ) {
    const creator = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const reportId = randomUUID();
    const titleFromPayload = payload.title?.trim();
    const titleFromFile = file?.originalname
      ?.replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();

    const fileName = titleFromPayload || titleFromFile || 'Generated Report';
    const fileType = payload.fileType?.trim() || file?.mimetype || 'application/pdf';
    const extractedText = payload.extractedText?.trim() || null;
    const summary = payload.summary?.trim() || null;
    const invoiceUrl = file ? this.buildInvoiceUrl(reportId) : payload.fileUrl?.trim() || '';
    const reportUrl = this.buildReportUrl(reportId);

    if (!invoiceUrl) {
      throw new BadRequestException('A document file or fileUrl is required to save a report.');
    }

    await this.ensureStorageDirectory();

    if (file) {
      await this.writeFileBuffer(this.getInvoicePath(reportId), file.buffer);
    }

    await this.writeReportPdf(
      this.getReportPath(reportId),
      {
        id: reportId,
        fileName,
        fileUrl: invoiceUrl,
        generatedFileUrl: reportUrl,
        fileType,
        extractedText,
        summary,
        createdAt: new Date(),
        uploadedBy: creator ? { name: creator.name, email: creator.email } : null,
      },
    );

    const created = (await this.prisma.document.create({
      data: {
        id: reportId,
        fileName,
        fileUrl: invoiceUrl,
        generatedFileUrl: reportUrl,
        fileType,
        extractedText,
        summary,
        uploadedById: userId,
      },
      include: { uploadedBy: true },
    })) as NarrativeReportRecord;

    return this.normalizeReport(created);
  }

  private async writeFileBuffer(filePath: string, buffer: Buffer) {
    await this.ensureStorageDirectory();
    await writeFile(filePath, buffer);
  }

  async getReportById(id: string) {
    const report = (await this.prisma.document.findUnique({
      where: { id },
      include: { uploadedBy: true },
    })) as NarrativeReportRecord | null;

    if (!report) {
      throw new NotFoundException('Report not found.');
    }

    return this.ensureGeneratedReport(report);
  }

  async getReportFilePath(id: string) {
    const filePath = this.getReportPath(id);
    if (!(await this.fileExists(filePath))) {
      throw new NotFoundException('Stored report file not found.');
    }
    return filePath;
  }

  async getInvoiceFilePath(id: string) {
    const filePath = await this.findInvoiceFilePath(id);
    if (!filePath) {
      throw new NotFoundException('Stored invoice file not found.');
    }
    return filePath;
  }
}
