/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NarrativesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    
    const reports = await this.prisma.document.findMany({
      where: { fileType: 'NARRATIVE_REPORT' },
      include: { uploadedBy: true }, 
      orderBy: { createdAt: 'desc' },
    });

    
    return reports.map(report => ({
      id: report.id.substring(0, 8).toUpperCase(),
      title: report.fileName,
      author: report.uploadedBy?.name || report.uploadedBy?.email || 'System Generated',
      status: report.extractedText ? 'Completed' : 'Draft', 
    }));
  }
}
