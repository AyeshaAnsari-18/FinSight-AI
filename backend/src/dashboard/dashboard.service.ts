/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptText } from '../common/security/data-protection';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  
  async getAccountantMetrics(userId: string) {
    const [journalCounts, myTasks, alerts] = await Promise.all([
      
      this.prisma.journalEntry.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      
      this.prisma.task.findMany({
        where: { 
          assignedToId: userId,
          status: { not: 'DONE' } 
        },
      }),

      
      this.prisma.journalEntry.findMany({
        where: { riskScore: { gt: 50 }, status: 'DRAFT' },
        take: 5,
        orderBy: { date: 'desc' },
        select: { id: true, description: true, riskScore: true, flagReason: true }
      }),
    ]);

    
    const accrualTasks = myTasks.filter((task) => {
      const title = decryptText(task.title)?.toLowerCase() || '';
      return title.includes('accrual');
    }).length;
    const taxTasks = myTasks.filter((task) => {
      const title = decryptText(task.title)?.toLowerCase() || '';
      return title.includes('tax') || title.includes('gst');
    }).length;

    const pendingJournals = journalCounts.find(j => j.status === 'DRAFT')?._count.status || 0;
    const flaggedJournals = journalCounts.find(j => j.status === 'FLAGGED')?._count.status || 0;

    return {
      kpi: {
        totalPendingTasks: myTasks.length,
        accrualTasks: accrualTasks, 
        taxTasks: taxTasks,         
        pendingJournals: pendingJournals,
        validationFailures: flaggedJournals,
        bankReconciliations: 3, 
        vendorReconciliations: 5, 
      },
      alerts: alerts.map(alert => ({
        id: alert.id,
        message: `${decryptText(alert.description) || ''}: ${decryptText(alert.flagReason) || ''}`,
        severity: (alert.riskScore ?? 0) > 80 ? 'high' : 'medium',
      }))
    };
  }
}
