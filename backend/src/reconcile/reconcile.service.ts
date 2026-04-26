/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, Reconciliation, ReconStatus } from '@prisma/client';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EngineService } from '../engine/engine.service';
import { decryptText, encryptText } from '../common/security/data-protection';
import { AnalyzeReconcileDto } from './dto/analyze-reconcile.dto';
import { CreateReconcileDto } from './dto/create-reconcile.dto';
import { ReconcileReviewDto } from './dto/reconcile-review.dto';

const MAX_REVIEW_BATCH = 24;

type SerializedReconciliation = {
  id: string;
  month: string;
  bankBalance: number;
  ledgerBalance: number;
  variance: number;
  status: ReconStatus;
  notes: string | null;
  createdAt: string;
};

type ReconciliationAnalysisResult = {
  matched: boolean;
  variance: number;
  discrepancies: string[];
};

type ReconciliationReviewResult = {
  reconciliation: SerializedReconciliation;
  analysis: ReconciliationAnalysisResult;
};

@Injectable()
export class ReconcileService {
  constructor(
    private prisma: PrismaService,
    private readonly engineService: EngineService, 
  ) {}

  async createAndAnalyze(dto: CreateReconcileDto) {
    const aiResult = await this.runAnalysis(
      dto.bankBalance,
      dto.ledgerBalance,
      dto.notes,
    );

    const reconciliation = await this.prisma.reconciliation.create({
      data: {
        month: new Date(dto.month),
        bankBalance: dto.bankBalance,
        ledgerBalance: dto.ledgerBalance,
        variance: aiResult.variance,
        status: aiResult.matched ? 'MATCHED' : 'DISCREPANCY',
        notes: encryptText(JSON.stringify(aiResult.discrepancies)),
      },
    });

    return {
      ...this.serializeReconciliation(reconciliation),
      analysis: aiResult,
    };
  }

  async findAll() {
    const reconciliations = await this.prisma.reconciliation.findMany({
      orderBy: { month: 'desc' },
    });

    return reconciliations.map((reconciliation) =>
      this.serializeReconciliation(reconciliation),
    );
  }

  async analyzePayload(dto: AnalyzeReconcileDto) {
    return this.runAnalysis(dto.bankBalance, dto.ledgerBalance, dto.notes || '');
  }

  async reanalyze(id: string) {
    const reconciliation = await this.findOneRecord(id);
    return this.reanalyzeRecord(reconciliation);
  }

  async reviewSummary(dto: ReconcileReviewDto) {
    const { records, appliedRange } = await this.getRecordsForReview(dto);

    if (!records.length) {
      return {
        scope: dto.scope || 'all',
        filters: {
          reconciliationId: dto.reconciliationId || null,
          status: dto.status || null,
          startDate: appliedRange.startDate,
          endDate: appliedRange.endDate,
          appliedCount: 0,
        },
        summary: {
          totalRecords: 0,
          matchedCount: 0,
          discrepancyCount: 0,
          pendingCount: 0,
          totalAbsoluteVariance: 0,
          averageAbsoluteVariance: 0,
          largestVariance: 0,
          topIssues: [],
        },
        insights: ['No reconciliation records matched the selected review scope.'],
        analyses: [],
      };
    }

    const analyses: ReconciliationReviewResult[] = [];
    for (const record of records) {
      analyses.push(await this.reanalyzeRecord(record));
    }

    const absoluteVariances = analyses.map((item) => Math.abs(item.analysis.variance));
    const totalAbsoluteVariance = absoluteVariances.reduce((sum, value) => sum + value, 0);
    const matchedCount = analyses.filter((item) => item.analysis.matched).length;
    const discrepancyCount = analyses.length - matchedCount;
    const pendingCount = analyses.filter(
      (item) => item.reconciliation.status === ReconStatus.PENDING,
    ).length;
    const topIssues = this.buildTopIssues(
      analyses.flatMap((item) => item.analysis.discrepancies),
    );

    return {
      scope: dto.scope || 'all',
      filters: {
        reconciliationId: dto.reconciliationId || null,
        status: dto.status || null,
        startDate: appliedRange.startDate,
        endDate: appliedRange.endDate,
        appliedCount: analyses.length,
      },
      summary: {
        totalRecords: analyses.length,
        matchedCount,
        discrepancyCount,
        pendingCount,
        totalAbsoluteVariance: Number(totalAbsoluteVariance.toFixed(2)),
        averageAbsoluteVariance: Number(
          (totalAbsoluteVariance / analyses.length).toFixed(2),
        ),
        largestVariance: Number(Math.max(...absoluteVariances).toFixed(2)),
        topIssues,
      },
      insights: this.buildReviewInsights(analyses, appliedRange),
      analyses: analyses.map((item) => ({
        ...item.reconciliation,
        ...item.analysis,
      })),
    };
  }

  private async findOneRecord(id: string) {
    const reconciliation = await this.prisma.reconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation ${id} not found`);
    }

    return reconciliation;
  }

  private serializeReconciliation(
    reconciliation: Reconciliation,
  ): SerializedReconciliation {
    return {
      ...reconciliation,
      month: reconciliation.month.toISOString(),
      createdAt: reconciliation.createdAt.toISOString(),
      bankBalance: Number(reconciliation.bankBalance),
      ledgerBalance: Number(reconciliation.ledgerBalance),
      variance: Number(reconciliation.variance),
      notes: decryptText(reconciliation.notes) || null,
    };
  }

  private normalizeAnalysis(raw: any): ReconciliationAnalysisResult {
    const discrepancies = Array.isArray(raw?.discrepancies)
      ? raw.discrepancies.filter(
          (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0,
        )
      : [];

    return {
      matched: Boolean(raw?.matched),
      variance: Math.abs(Number(raw?.variance ?? 0)),
      discrepancies,
    };
  }

  private async runAnalysis(
    bankBalance: number,
    ledgerBalance: number,
    notes: string,
  ): Promise<ReconciliationAnalysisResult> {
    try {
      return this.normalizeAnalysis(
        await this.engineService.analyzeReconciliation({
          bank_balance: bankBalance,
          ledger_balance: ledgerBalance,
          notes,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('AI Engine failed during reconciliation.');
    }
  }

  private async reanalyzeRecord(
    reconciliation: Reconciliation,
  ): Promise<ReconciliationReviewResult> {
    const plainReconciliation = this.serializeReconciliation(reconciliation);
    const analysis = await this.runAnalysis(
      Number(plainReconciliation.bankBalance),
      Number(plainReconciliation.ledgerBalance),
      plainReconciliation.notes || '',
    );

    const updated = await this.prisma.reconciliation.update({
      where: { id: reconciliation.id },
      data: {
        variance: analysis.variance,
        status: analysis.matched ? ReconStatus.MATCHED : ReconStatus.DISCREPANCY,
        notes: encryptText(JSON.stringify(analysis.discrepancies)),
      },
    });

    return {
      reconciliation: this.serializeReconciliation(updated),
      analysis,
    };
  }

  private async getRecordsForReview(dto: ReconcileReviewDto) {
    if (dto.scope === 'selected' && !dto.reconciliationId) {
      throw new BadRequestException('Select a reconciliation before running a focused analysis.');
    }

    const appliedRange = this.resolveDateRange(dto);
    const where: Prisma.ReconciliationWhereInput = {};

    if (dto.reconciliationId) {
      where.id = dto.reconciliationId;
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (appliedRange.startDate || appliedRange.endDate) {
      where.month = {};

      if (appliedRange.startDate) {
        where.month.gte = appliedRange.startDate;
      }

      if (appliedRange.endDate) {
        where.month.lte = appliedRange.endDate;
      }
    }

    const requestedLimit = Number(dto.limit ?? 12);
    const take = dto.reconciliationId
      ? undefined
      : Math.min(requestedLimit, MAX_REVIEW_BATCH);

    const records = await this.prisma.reconciliation.findMany({
      where,
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
      ...(take ? { take } : {}),
    });

    return {
      records,
      appliedRange: {
        startDate: appliedRange.startDate?.toISOString() || null,
        endDate: appliedRange.endDate?.toISOString() || null,
      },
    };
  }

  private resolveDateRange(dto: ReconcileReviewDto) {
    const now = new Date();
    const scope = dto.scope || 'all';

    if (scope === 'dateRange') {
      return {
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate
          ? new Date(new Date(dto.endDate).setHours(23, 59, 59, 999))
          : null,
      };
    }

    if (scope === 'currentMonth') {
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    }

    if (scope === 'currentQuarter') {
      const startMonth = Math.floor(now.getMonth() / 3) * 3;
      return {
        startDate: new Date(now.getFullYear(), startMonth, 1),
        endDate: new Date(now.getFullYear(), startMonth + 3, 0, 23, 59, 59, 999),
      };
    }

    if (scope === 'currentYear') {
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    }

    return {
      startDate: null,
      endDate: null,
    };
  }

  private buildTopIssues(issues: string[]) {
    const counts = new Map<string, number>();

    for (const issue of issues) {
      counts.set(issue, (counts.get(issue) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));
  }

  private buildReviewInsights(
    analyses: ReconciliationReviewResult[],
    appliedRange: { startDate: string | null; endDate: string | null },
  ) {
    const discrepancyCount = analyses.filter((item) => !item.analysis.matched).length;
    const largestVarianceItem = [...analyses].sort(
      (left, right) => right.analysis.variance - left.analysis.variance,
    )[0];
    const periodLabel =
      appliedRange.startDate && appliedRange.endDate
        ? `${new Date(appliedRange.startDate).toLocaleDateString()} to ${new Date(
            appliedRange.endDate,
          ).toLocaleDateString()}`
        : 'the selected review scope';

    const insights = [
      `Reviewed ${analyses.length} reconciliation run${analyses.length === 1 ? '' : 's'} across ${periodLabel}.`,
      `${discrepancyCount} item${discrepancyCount === 1 ? '' : 's'} still require follow-up based on the refreshed AI review.`,
    ];

    if (largestVarianceItem) {
      insights.push(
        `Largest variance is ${largestVarianceItem.analysis.variance.toFixed(2)} on ${new Date(
          largestVarianceItem.reconciliation.month,
        ).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}.`,
      );
    }

    return insights;
  }
}
