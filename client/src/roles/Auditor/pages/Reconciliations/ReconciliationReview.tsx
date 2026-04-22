import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarRange,
  LoaderCircle,
  Repeat,
  Search,
  Sparkles,
} from "lucide-react";
import { getReconciliations } from "../../services/auditor.api";
import {
  reconciliationAuditApi,
  type ReconciliationReviewAnalysis,
  type ReconciliationReviewScope,
  type ReconciliationReviewSummary,
} from "../../services/reconciliationAudit.api";

type AuditorReconciliation = {
  id: string;
  month: string;
  bankBalance: number;
  ledgerBalance: number;
  variance: number;
  status: "PENDING" | "MATCHED" | "DISCREPANCY";
  notes: string | null;
  createdAt?: string;
};

const scopeOptions: Array<{ value: ReconciliationReviewScope; label: string }> = [
  { value: "currentQuarter", label: "Current quarter" },
  { value: "currentMonth", label: "Current month" },
  { value: "currentYear", label: "Current year" },
  { value: "dateRange", label: "Custom date range" },
  { value: "selected", label: "Selected reconciliation" },
  { value: "all", label: "All reconciliations" },
];

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const statusPill = (status: AuditorReconciliation["status"]) => {
  if (status === "MATCHED") return "bg-emerald-100 text-emerald-700";
  if (status === "DISCREPANCY") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
};

const parseNotes = (notes: string | null) => {
  if (!notes) return [];

  try {
    const parsed = JSON.parse(notes);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [notes];
  }
};

const ReconciliationReview = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [records, setRecords] = useState<AuditorReconciliation[]>([]);
  const [scope, setScope] = useState<ReconciliationReviewScope>("currentQuarter");
  const [selectedReconciliationId, setSelectedReconciliationId] = useState("");
  const [startDate, setStartDate] = useState(
    formatDateInput(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [endDate, setEndDate] = useState(formatDateInput(new Date()));
  const [summary, setSummary] = useState<ReconciliationReviewSummary | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<ReconciliationReviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [rowAnalyzingId, setRowAnalyzingId] = useState("");
  const [error, setError] = useState("");

  const loadReconciliations = async () => {
    setLoading(true);

    try {
      const response = await getReconciliations();
      setRecords(response);

      if (!selectedReconciliationId && response.length > 0) {
        setSelectedReconciliationId(response[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load reconciliations right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReconciliations();
  }, []);

  const handleSummaryAnalysis = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const reviewSummary = await reconciliationAuditApi.getReviewSummary({
        scope,
        reconciliationId:
          scope === "selected" ? selectedReconciliationId : undefined,
        status:
          statusFilter === "ALL"
            ? undefined
            : (statusFilter as AuditorReconciliation["status"]),
        startDate: scope === "dateRange" ? startDate : undefined,
        endDate: scope === "dateRange" ? endDate : undefined,
        limit: scope === "selected" ? 1 : 10,
      });

      setSummary(reviewSummary);
      setSelectedAnalysis(reviewSummary.analyses[0] ?? null);
      await loadReconciliations();
    } catch (err) {
      console.error(err);
      setError("AI review could not be completed for the selected reconciliation scope.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSingleAnalysis = async (reconciliationId: string) => {
    setRowAnalyzingId(reconciliationId);
    setError("");

    try {
      const analysis = await reconciliationAuditApi.analyzeReconciliation(
        reconciliationId,
      );
      setSelectedAnalysis(analysis);
      await loadReconciliations();
    } catch (err) {
      console.error(err);
      setError("That reconciliation could not be analyzed right now.");
    } finally {
      setRowAnalyzingId("");
    }
  };

  const filteredData = records.filter((item) => {
    const issueText = parseNotes(item.notes).join(" ").toLowerCase();
    const matchesSearch =
      issueText.includes(search.toLowerCase()) ||
      new Date(item.month)
        .toLocaleDateString(undefined, { month: "long", year: "numeric" })
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const matchedCount = records.filter((item) => item.status === "MATCHED").length;
  const discrepancyCount = records.filter(
    (item) => item.status === "DISCREPANCY",
  ).length;
  const pendingCount = records.filter((item) => item.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#0A2342] via-[#12446E] to-[#2383A1] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <Repeat className="h-4 w-4" />
              Reconciliation monitor
            </div>
            <h1 className="text-3xl font-bold">Reconciliation Review</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Re-run AI analysis for any reconciliation, summarize a time window, and
              surface the biggest variance drivers directly in the review queue.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Matched
              </div>
              <div className="mt-2 text-2xl font-semibold">{matchedCount}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Discrepancies
              </div>
              <div className="mt-2 text-2xl font-semibold">{discrepancyCount}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Pending
              </div>
              <div className="mt-2 text-2xl font-semibold">{pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#0A2342]">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-xl font-semibold">AI Review Scope</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <label className="text-sm text-slate-600">
            Review scope
            <select
              value={scope}
              onChange={(event) =>
                setScope(event.target.value as ReconciliationReviewScope)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#2383A1]"
            >
              {scopeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-600">
            Status slice
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#2383A1]"
            >
              <option value="ALL">All statuses</option>
              <option value="MATCHED">Matched</option>
              <option value="DISCREPANCY">Discrepancy</option>
              <option value="PENDING">Pending</option>
            </select>
          </label>

          {scope === "selected" && (
            <label className="text-sm text-slate-600">
              Reconciliation
              <select
                value={selectedReconciliationId}
                onChange={(event) => setSelectedReconciliationId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#2383A1]"
              >
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {new Date(record.month).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    - Variance {Number(record.variance).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
          )}

          {scope === "dateRange" && (
            <>
              <label className="text-sm text-slate-600">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#2383A1]"
                />
              </label>

              <label className="text-sm text-slate-600">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#2383A1]"
                />
              </label>
            </>
          )}

          <button
            type="button"
            onClick={handleSummaryAnalysis}
            disabled={analyzing || loading || (scope === "selected" && !selectedReconciliationId)}
            className="flex items-center justify-center gap-2 self-end rounded-2xl bg-[#0A2342] px-5 py-3 font-semibold text-white transition hover:bg-[#12446E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Reviewing...
              </>
            ) : (
              <>
                <CalendarRange className="h-4 w-4" />
                Analyze reconciliations
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>

      {summary && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0A2342]">AI Review Summary</h2>
              <p className="text-sm text-slate-500">
                {summary.filters.appliedCount} reconciliation run{summary.filters.appliedCount === 1 ? "" : "s"} analyzed in the current scope.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              Largest variance: {summary.summary.largestVariance.toFixed(2)}
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Records reviewed</div>
              <div className="mt-2 text-3xl font-semibold text-[#0A2342]">
                {summary.summary.totalRecords}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-sm text-emerald-600">Matched cleanly</div>
              <div className="mt-2 text-3xl font-semibold text-emerald-700">
                {summary.summary.matchedCount}
              </div>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <div className="text-sm text-rose-500">Discrepancies</div>
              <div className="mt-2 text-3xl font-semibold text-rose-700">
                {summary.summary.discrepancyCount}
              </div>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <div className="text-sm text-sky-600">Average absolute variance</div>
              <div className="mt-2 text-3xl font-semibold text-sky-700">
                {summary.summary.averageAbsoluteVariance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-3 flex items-center gap-2 text-[#0A2342]">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="font-semibold">Reviewer notes</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                {summary.insights.map((insight) => (
                  <p key={insight}>{insight}</p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="mb-3 font-semibold text-[#0A2342]">Most common issues</h3>
              {summary.summary.topIssues.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {summary.summary.topIssues.map((issue) => (
                    <span
                      key={issue.label}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    >
                      {issue.label} - {issue.count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No recurring discrepancy patterns were found in this run.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAnalysis && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0A2342]">
                Latest Reconciliation Analysis
              </h2>
              <p className="text-sm text-slate-500">
                {new Date(selectedAnalysis.month).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Variance {selectedAnalysis.variance.toFixed(2)}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-3">
                <div>
                  <div className="text-slate-500">Bank balance</div>
                  <div className="mt-1 font-semibold">
                    {selectedAnalysis.bankBalance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Ledger balance</div>
                  <div className="mt-1 font-semibold">
                    {selectedAnalysis.ledgerBalance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Matched</div>
                  <div className="mt-1 font-semibold">
                    {selectedAnalysis.matched ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="mb-3 font-semibold text-[#0A2342]">Discrepancy notes</h3>
              {selectedAnalysis.discrepancies.length > 0 ? (
                <div className="space-y-2 text-sm text-slate-600">
                  {selectedAnalysis.discrepancies.map((issue) => (
                    <p key={issue}>{issue}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No discrepancy notes were returned for this item.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#0A2342]">
              Reconciliation Queue
            </h2>
            <p className="text-sm text-slate-500">
              Filter the queue, then re-run AI analysis on any single reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search month or issue"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12 text-slate-400">
            Loading reconciliation reviews...
          </div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-[#0A2342] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Balances</th>
                <th className="px-4 py-3 text-left">Variance</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-100 transition hover:bg-slate-50 ${
                      selectedAnalysis?.id === item.id ? "bg-sky-50/60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[#0A2342]">
                      {new Date(item.month).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <div>Bank {Number(item.bankBalance).toFixed(2)}</div>
                      <div className="text-slate-500">
                        Ledger {Number(item.ledgerBalance).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {Number(item.variance).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {parseNotes(item.notes).slice(0, 2).join(" ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleSingleAnalysis(item.id)}
                        disabled={rowAnalyzingId === item.id}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#0A2342] hover:text-[#0A2342] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {rowAnalyzingId === item.id ? "Analyzing..." : "Analyze"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReconciliationReview;
