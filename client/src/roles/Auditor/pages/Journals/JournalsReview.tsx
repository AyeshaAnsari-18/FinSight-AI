import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CalendarRange,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { getJournals } from "../../services/auditor.api";
import {
  journalAuditApi,
  type JournalReviewAnalysis,
  type JournalReviewScope,
  type JournalReviewSummary,
} from "../../services/journalAudit.api";

type AuditorJournal = {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  status: "DRAFT" | "POSTED" | "FLAGGED" | "REJECTED";
  riskScore?: number | null;
  flagReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const scopeOptions: Array<{ value: JournalReviewScope; label: string }> = [
  { value: "currentYear", label: "Current year" },
  { value: "currentQuarter", label: "Current quarter" },
  { value: "currentMonth", label: "Current month" },
  { value: "dateRange", label: "Custom date range" },
  { value: "selected", label: "Selected journal" },
  { value: "all", label: "All journals" },
];

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const statusPill = (status: AuditorJournal["status"]) => {
  if (status === "POSTED") return "bg-emerald-100 text-emerald-700";
  if (status === "FLAGGED") return "bg-rose-100 text-rose-700";
  if (status === "REJECTED") return "bg-slate-200 text-slate-700";
  return "bg-amber-100 text-amber-700";
};

const JournalsReview = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [journals, setJournals] = useState<AuditorJournal[]>([]);
  const [scope, setScope] = useState<JournalReviewScope>("currentYear");
  const [selectedJournalId, setSelectedJournalId] = useState("");
  const [startDate, setStartDate] = useState(
    formatDateInput(new Date(new Date().getFullYear(), 0, 1)),
  );
  const [endDate, setEndDate] = useState(formatDateInput(new Date()));
  const [summary, setSummary] = useState<JournalReviewSummary | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<JournalReviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [rowAnalyzingId, setRowAnalyzingId] = useState("");
  const [error, setError] = useState("");

  const loadJournals = async () => {
    setLoading(true);

    try {
      const response = await getJournals();
      setJournals(response);

      if (!selectedJournalId && response.length > 0) {
        setSelectedJournalId(response[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load journals right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJournals();
  }, []);

  const handleSummaryAnalysis = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const reviewSummary = await journalAuditApi.getReviewSummary({
        scope,
        journalId: scope === "selected" ? selectedJournalId : undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as AuditorJournal["status"]),
        startDate: scope === "dateRange" ? startDate : undefined,
        endDate: scope === "dateRange" ? endDate : undefined,
        limit: scope === "selected" ? 1 : 10,
      });

      setSummary(reviewSummary);
      setSelectedAnalysis(reviewSummary.analyses[0] ?? null);
      await loadJournals();
    } catch (err) {
      console.error(err);
      setError("AI review could not be completed for the selected journal scope.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSingleAnalysis = async (journalId: string) => {
    setRowAnalyzingId(journalId);
    setError("");

    try {
      const analysis = await journalAuditApi.analyzeJournal(journalId);
      setSelectedAnalysis(analysis);
      await loadJournals();
    } catch (err) {
      console.error(err);
      setError("That journal could not be analyzed right now.");
    } finally {
      setRowAnalyzingId("");
    }
  };

  const filteredData = journals.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const postedCount = journals.filter((item) => item.status === "POSTED").length;
  const draftCount = journals.filter((item) => item.status === "DRAFT").length;
  const flaggedCount = journals.filter((item) => item.status === "FLAGGED").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#0A2342] via-[#143B64] to-[#1F5F8B] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <BookOpenCheck className="h-4 w-4" />
              Auditor workspace
            </div>
            <h1 className="text-3xl font-bold">Journals Review</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Run AI review summaries on a specific journal, an entire period, or the
              current fiscal slice and inspect the reasoning without leaving this page.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Posted
              </div>
              <div className="mt-2 text-2xl font-semibold">{postedCount}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Draft
              </div>
              <div className="mt-2 text-2xl font-semibold">{draftCount}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Flagged
              </div>
              <div className="mt-2 text-2xl font-semibold">{flaggedCount}</div>
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
              onChange={(event) => setScope(event.target.value as JournalReviewScope)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#1F5F8B]"
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
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#1F5F8B]"
            >
              <option value="ALL">All statuses</option>
              <option value="POSTED">Posted</option>
              <option value="DRAFT">Draft</option>
              <option value="FLAGGED">Flagged</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>

          {scope === "selected" && (
            <label className="text-sm text-slate-600">
              Journal entry
              <select
                value={selectedJournalId}
                onChange={(event) => setSelectedJournalId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#1F5F8B]"
              >
                {journals.map((journal) => (
                  <option key={journal.id} value={journal.id}>
                    {journal.reference} - {journal.description}
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
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#1F5F8B]"
                />
              </label>

              <label className="text-sm text-slate-600">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-[#1F5F8B]"
                />
              </label>
            </>
          )}

          <button
            type="button"
            onClick={handleSummaryAnalysis}
            disabled={analyzing || loading || (scope === "selected" && !selectedJournalId)}
            className="flex items-center justify-center gap-2 self-end rounded-2xl bg-[#0A2342] px-5 py-3 font-semibold text-white transition hover:bg-[#143B64] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Reviewing...
              </>
            ) : (
              <>
                <CalendarRange className="h-4 w-4" />
                Analyze journals
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
                {summary.filters.appliedCount} entr{summary.filters.appliedCount === 1 ? "y" : "ies"} analyzed in the current scope.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              Highest risk: {summary.summary.highestRiskScore}/100
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Entries reviewed</div>
              <div className="mt-2 text-3xl font-semibold text-[#0A2342]">
                {summary.summary.totalEntries}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Average risk score</div>
              <div className="mt-2 text-3xl font-semibold text-[#0A2342]">
                {summary.summary.averageRiskScore}
              </div>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <div className="text-sm text-rose-500">Flagged entries</div>
              <div className="mt-2 text-3xl font-semibold text-rose-700">
                {summary.summary.flaggedEntries}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-sm text-emerald-600">Net debit minus credit</div>
              <div className="mt-2 text-3xl font-semibold text-emerald-700">
                {summary.summary.netDifference.toFixed(2)}
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
              <h3 className="mb-3 font-semibold text-[#0A2342]">Most common flags</h3>
              {summary.summary.topFlags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {summary.summary.topFlags.map((flag) => (
                    <span
                      key={flag.label}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    >
                      {flag.label} - {flag.count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  The AI did not detect recurring exception patterns in this run.
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
                Latest Journal Analysis
              </h2>
              <p className="text-sm text-slate-500">
                {selectedAnalysis.reference} - {selectedAnalysis.description}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Risk score {selectedAnalysis.riskScore}/100
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
              {selectedAnalysis.reasoning}
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="mb-3 font-semibold text-[#0A2342]">Flags</h3>
              {selectedAnalysis.flags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.flags.map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full bg-rose-50 px-3 py-2 text-sm text-rose-700"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No explicit anomaly flags were returned for this item.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#0A2342]">Journal Queue</h2>
            <p className="text-sm text-slate-500">
              Search the queue, then run a one-click AI review on any single entry.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search description or reference"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12 text-slate-400">
            Loading journal reviews...
          </div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-[#0A2342] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Ref</th>
                <th className="px-4 py-3 text-left">Journal</th>
                <th className="px-4 py-3 text-left">Review Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Risk</th>
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
                      {item.reference}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{item.description}</div>
                      <div className="text-xs text-slate-500">
                        Debit {Number(item.debit).toFixed(2)} - Credit{" "}
                        {Number(item.credit).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(item.updatedAt || item.date).toLocaleDateString()}
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
                    <td className="px-4 py-3 text-slate-700">
                      {typeof item.riskScore === "number" ? `${item.riskScore}/100` : "Not run"}
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

export default JournalsReview;
