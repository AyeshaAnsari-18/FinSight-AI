import api from "../../../lib/api";

export type ReconciliationReviewScope =
  | "all"
  | "selected"
  | "dateRange"
  | "currentMonth"
  | "currentQuarter"
  | "currentYear";

export interface ReconciliationReviewRequest {
  scope: ReconciliationReviewScope;
  reconciliationId?: string;
  status?: "PENDING" | "MATCHED" | "DISCREPANCY";
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface ReconciliationReviewAnalysis {
  id: string;
  month: string;
  bankBalance: number;
  ledgerBalance: number;
  variance: number;
  status: "PENDING" | "MATCHED" | "DISCREPANCY";
  notes: string | null;
  createdAt: string;
  matched: boolean;
  discrepancies: string[];
}

export interface ReconciliationReviewSummary {
  scope: ReconciliationReviewScope;
  filters: {
    reconciliationId: string | null;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
    appliedCount: number;
  };
  summary: {
    totalRecords: number;
    matchedCount: number;
    discrepancyCount: number;
    pendingCount: number;
    totalAbsoluteVariance: number;
    averageAbsoluteVariance: number;
    largestVariance: number;
    topIssues: Array<{ label: string; count: number }>;
  };
  insights: string[];
  analyses: ReconciliationReviewAnalysis[];
}

export const reconciliationAuditApi = {
  async getReviewSummary(payload: ReconciliationReviewRequest) {
    const response = await api.post<ReconciliationReviewSummary>(
      "/reconcile/review-summary",
      payload,
    );
    return response.data;
  },

  async analyzeReconciliation(reconciliationId: string) {
    const response = await api.post<{
      reconciliation: Omit<
        ReconciliationReviewAnalysis,
        "matched" | "discrepancies"
      >;
      analysis: {
        matched: boolean;
        variance: number;
        discrepancies: string[];
      };
    }>(`/reconcile/${reconciliationId}/analyze`);

    const { reconciliation, analysis } = response.data;
    return {
      ...reconciliation,
      ...analysis,
    } as ReconciliationReviewAnalysis;
  },
};
