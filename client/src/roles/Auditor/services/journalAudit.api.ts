import api from "../../../lib/api";

export type JournalReviewScope =
  | "all"
  | "selected"
  | "dateRange"
  | "currentMonth"
  | "currentQuarter"
  | "currentYear";

export interface JournalReviewRequest {
  scope: JournalReviewScope;
  journalId?: string;
  status?: "DRAFT" | "POSTED" | "FLAGGED" | "REJECTED";
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface JournalReviewAnalysis {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  status: "DRAFT" | "POSTED" | "FLAGGED" | "REJECTED";
  riskScore: number;
  flags: string[];
  reasoning: string;
  flagReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalReviewSummary {
  scope: JournalReviewScope;
  filters: {
    journalId: string | null;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
    appliedCount: number;
  };
  summary: {
    totalEntries: number;
    flaggedEntries: number;
    averageRiskScore: number;
    highestRiskScore: number;
    totalDebit: number;
    totalCredit: number;
    netDifference: number;
    topFlags: Array<{ label: string; count: number }>;
  };
  insights: string[];
  analyses: JournalReviewAnalysis[];
}

export const journalAuditApi = {
  async getReviewSummary(payload: JournalReviewRequest) {
    const response = await api.post<JournalReviewSummary>("/journals/review-summary", payload);
    return response.data;
  },

  async analyzeJournal(journalId: string) {
    const response = await api.post<{
      journal: Omit<JournalReviewAnalysis, "flags" | "reasoning">;
      analysis: {
        riskScore: number;
        flags: string[];
        reasoning: string;
      };
    }>(`/journals/${journalId}/analyze`);

    const { journal, analysis } = response.data;
    return {
      ...journal,
      ...analysis,
    } as JournalReviewAnalysis;
  },
};
