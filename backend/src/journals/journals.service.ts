import { JournalEntry, JournalStatus, Prisma } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EngineService } from '../engine/engine.service';
import { decryptText, encryptText } from '../common/security/data-protection';
import { AnalyzeJournalDto } from './dto/analyze-journal.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JournalReviewDto } from './dto/journal-review.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

const HIGH_RISK_THRESHOLD = 70;
const MAX_REVIEW_BATCH = 24;

type SerializedJournal = {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  status: JournalStatus;
  riskScore: number | null;
  flagReason: string | null;
  createdAt: string;
  updatedAt: string;
};

type JournalAnalysisResult = {
  riskScore: number;
  flags: string[];
  reasoning: string;
};

type JournalReviewResult = {
  journal: SerializedJournal;
  analysis: JournalAnalysisResult;
};

@Injectable()
export class JournalsService {
  constructor(
    private prisma: PrismaService,
    private readonly engineService: EngineService,
  ) {}

  async create(dto: CreateJournalDto) {
    const journal = await this.prisma.journalEntry.create({
      data: {
        date: new Date(dto.date),
        description: encryptText(dto.description),
        reference: encryptText(dto.reference),
        debit: dto.debit,
        credit: dto.credit,
        status: dto.status || 'DRAFT',
      },
    });

    return this.serializeJournal(journal);
  }

  async findAll() {
    const journals = await this.prisma.journalEntry.findMany({
      orderBy: { date: 'desc' },
    });

    return journals.map((journal) => this.serializeJournal(journal));
  }

  async findOne(id: string) {
    const journal = await this.findOneRecord(id);
    return this.serializeJournal(journal);
  }

  async update(id: string, dto: UpdateJournalDto) {
    await this.findOneRecord(id);

    const journal = await this.prisma.journalEntry.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        description:
          dto.description === undefined ? undefined : encryptText(dto.description),
        reference:
          dto.reference === undefined ? undefined : encryptText(dto.reference),
        debit: dto.debit,
        credit: dto.credit,
        status: dto.status,
      },
    });

    return this.serializeJournal(journal);
  }

  async remove(id: string) {
    await this.findOneRecord(id);
    return this.prisma.journalEntry.delete({ where: { id } });
  }

  async analyzeDraft(dto: AnalyzeJournalDto) {
    return this.normalizeAnalysis(await this.engineService.analyzeJournal(dto));
  }

  async reanalyze(id: string) {
    const journal = await this.findOneRecord(id);
    return this.analyzeAndPersist(journal);
  }

  async reviewSummary(dto: JournalReviewDto) {
    const { entries, appliedRange } = await this.getEntriesForReview(dto);

    if (!entries.length) {
      return {
        scope: dto.scope || 'all',
        filters: {
          journalId: dto.journalId || null,
          status: dto.status || null,
          startDate: appliedRange.startDate,
          endDate: appliedRange.endDate,
          appliedCount: 0,
        },
        summary: {
          totalEntries: 0,
          flaggedEntries: 0,
          averageRiskScore: 0,
          highestRiskScore: 0,
          totalDebit: 0,
          totalCredit: 0,
          netDifference: 0,
          topFlags: [],
        },
        insights: ['No journal entries matched the selected review scope.'],
        analyses: [],
      };
    }

    const analyses: JournalReviewResult[] = [];
    for (const entry of entries) {
      analyses.push(await this.analyzeAndPersist(entry));
    }

    const totalDebit = analyses.reduce((sum, item) => sum + item.journal.debit, 0);
    const totalCredit = analyses.reduce((sum, item) => sum + item.journal.credit, 0);
    const flaggedEntries = analyses.filter(
      (item) =>
        item.analysis.riskScore >= HIGH_RISK_THRESHOLD || item.analysis.flags.length > 0,
    ).length;
    const highestRiskScore = analyses.reduce(
      (max, item) => Math.max(max, item.analysis.riskScore),
      0,
    );
    const averageRiskScore =
      analyses.reduce((sum, item) => sum + item.analysis.riskScore, 0) / analyses.length;
    const topFlags = this.buildTopFlags(
      analyses.flatMap((item) => item.analysis.flags),
    );

    return {
      scope: dto.scope || 'all',
      filters: {
        journalId: dto.journalId || null,
        status: dto.status || null,
        startDate: appliedRange.startDate,
        endDate: appliedRange.endDate,
        appliedCount: analyses.length,
      },
      summary: {
        totalEntries: analyses.length,
        flaggedEntries,
        averageRiskScore: Number(averageRiskScore.toFixed(1)),
        highestRiskScore,
        totalDebit: Number(totalDebit.toFixed(2)),
        totalCredit: Number(totalCredit.toFixed(2)),
        netDifference: Number((totalDebit - totalCredit).toFixed(2)),
        topFlags,
      },
      insights: this.buildReviewInsights(analyses, appliedRange),
      analyses: analyses.map((item) => ({
        ...item.journal,
        ...item.analysis,
      })),
    };
  }

  private async findOneRecord(id: string) {
    const journal = await this.prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!journal) {
      throw new NotFoundException(`Journal entry ${id} not found`);
    }

    return journal;
  }

  private serializeJournal(journal: JournalEntry): SerializedJournal {
    return {
      ...journal,
      date: journal.date.toISOString(),
      createdAt: journal.createdAt.toISOString(),
      updatedAt: journal.updatedAt.toISOString(),
      debit: Number(journal.debit),
      credit: Number(journal.credit),
      description: decryptText(journal.description) || '',
      reference: decryptText(journal.reference) || '',
      flagReason: decryptText(journal.flagReason) || null,
    };
  }

  private normalizeAnalysis(raw: any): JournalAnalysisResult {
    const flags = Array.isArray(raw?.flags)
      ? raw.flags.filter((flag: unknown): flag is string => typeof flag === 'string' && flag.trim().length > 0)
      : [];

    return {
      riskScore: Number(raw?.risk_score ?? 0),
      flags,
      reasoning:
        typeof raw?.reasoning === 'string' && raw.reasoning.trim().length > 0
          ? raw.reasoning
          : 'No reasoning was returned by the AI engine.',
    };
  }

  private async analyzeAndPersist(journal: JournalEntry): Promise<JournalReviewResult> {
    const plainJournal = this.serializeJournal(journal);
    const analysis = this.normalizeAnalysis(
      await this.engineService.analyzeJournal({
        description: plainJournal.description,
        debit: Number(plainJournal.debit),
        credit: Number(plainJournal.credit),
        reference: plainJournal.reference,
      }),
    );

    const updated = await this.prisma.journalEntry.update({
      where: { id: journal.id },
      data: {
        riskScore: analysis.riskScore,
        flagReason: analysis.flags.length
          ? encryptText(analysis.flags.join(' | '))
          : null,
        status:
          analysis.riskScore >= HIGH_RISK_THRESHOLD
            ? JournalStatus.FLAGGED
            : plainJournal.status,
      },
    });

    return {
      journal: this.serializeJournal(updated),
      analysis,
    };
  }

  private async getEntriesForReview(dto: JournalReviewDto) {
    if (dto.scope === 'selected' && !dto.journalId) {
      throw new BadRequestException('Select a journal entry before running a focused analysis.');
    }

    const appliedRange = this.resolveDateRange(dto);
    const where: Prisma.JournalEntryWhereInput = {};

    if (dto.journalId) {
      where.id = dto.journalId;
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (appliedRange.startDate || appliedRange.endDate) {
      where.date = {};

      if (appliedRange.startDate) {
        where.date.gte = appliedRange.startDate;
      }

      if (appliedRange.endDate) {
        where.date.lte = appliedRange.endDate;
      }
    }

    const requestedLimit = Number(dto.limit ?? 12);
    const take = dto.journalId ? undefined : Math.min(requestedLimit, MAX_REVIEW_BATCH);

    const entries = await this.prisma.journalEntry.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      ...(take ? { take } : {}),
    });

    return {
      entries,
      appliedRange: {
        startDate: appliedRange.startDate?.toISOString() || null,
        endDate: appliedRange.endDate?.toISOString() || null,
      },
    };
  }

  private resolveDateRange(dto: JournalReviewDto) {
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

  private buildTopFlags(flags: string[]) {
    const counts = new Map<string, number>();

    for (const flag of flags) {
      counts.set(flag, (counts.get(flag) || 0) + 1);
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));
  }

  private buildReviewInsights(
    analyses: JournalReviewResult[],
    appliedRange: { startDate: string | null; endDate: string | null },
  ) {
    const flaggedEntries = analyses.filter(
      (item) =>
        item.analysis.riskScore >= HIGH_RISK_THRESHOLD || item.analysis.flags.length > 0,
    );
    const riskiest = [...analyses].sort(
      (left, right) => right.analysis.riskScore - left.analysis.riskScore,
    )[0];
    const periodLabel =
      appliedRange.startDate && appliedRange.endDate
        ? `${new Date(appliedRange.startDate).toLocaleDateString()} to ${new Date(
            appliedRange.endDate,
          ).toLocaleDateString()}`
        : 'the selected review scope';

    const insights = [
      `Reviewed ${analyses.length} journal entr${analyses.length === 1 ? 'y' : 'ies'} across ${periodLabel}.`,
      `${flaggedEntries.length} entr${flaggedEntries.length === 1 ? 'y' : 'ies'} triggered escalation signals at or above the ${HIGH_RISK_THRESHOLD}/100 threshold.`,
    ];

    if (riskiest) {
      insights.push(
        `Highest-risk item is ${riskiest.journal.reference} at ${riskiest.analysis.riskScore}/100 with ${riskiest.analysis.flags.length || 1} key review note${riskiest.analysis.flags.length === 1 ? '' : 's'}.`,
      );
    }

    return insights;
  }
}
