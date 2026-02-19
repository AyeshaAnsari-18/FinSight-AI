import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditTrailDto } from './dto/create-audit-trail.dto';

@Injectable()
export class AuditTrailService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuditTrailDto) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        details: dto.details,
        ipAddress: dto.ipAddress,
        userId: dto.userId,
      },
    });
  }

  async findAll() {
    const logs = await this.prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((log) => ({
      id: log.id.substring(0, 8).toUpperCase(),
      user: log.user?.name || log.user?.email || 'Unknown User',
      action: log.action,
      date: log.createdAt,
    }));
  }
}
