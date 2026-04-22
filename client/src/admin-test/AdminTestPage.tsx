import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Lock,
  LogOut,
  Play,
  RefreshCw,
  ShieldCheck,
  User2,
  XCircle,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  adminTestLogin,
  clearAdminTestSession,
  downloadAdminTestReport,
  fetchAdminTestCatalog,
  fetchAdminTestReport,
  fetchAdminTestReports,
  getAdminTestSession,
  openAdminTestReportPdf,
  runAdminTestSuites,
  type AdminTestReport,
  type AdminTestSuite,
} from "./adminTest.api";

const formatDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Still running";

const formatDuration = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`;

const statusClassMap: Record<string, string> = {
  PASSED: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30",
  FAILED: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30",
  SAFE: "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30",
  FULL: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30",
};

const resultClassMap: Record<"passed" | "failed" | "skipped", string> = {
  passed: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20",
  failed: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20",
  skipped: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20",
};

const resultIconMap = {
  passed: CheckCircle2,
  failed: XCircle,
  skipped: Bot,
};

const getReportSuiteLabels = (report: AdminTestReport) => {
  const labelsFromSummary = report.summary.suiteLabels?.filter(Boolean);
  if (labelsFromSummary?.length) {
    return labelsFromSummary;
  }

  return [...new Set(report.results.map((result) => result.suiteLabel))];
};

const groupReportResults = (report: AdminTestReport | null) => {
  if (!report) {
    return [];
  }

  const groups = new Map<
    string,
    {
      label: string;
      passed: number;
      failed: number;
      skipped: number;
      results: AdminTestReport["results"];
    }
  >();

  for (const result of report.results) {
    const current = groups.get(result.suiteId) || {
      label: result.suiteLabel,
      passed: 0,
      failed: 0,
      skipped: 0,
      results: [],
    };

    current.results.push(result);
    current[result.status] += 1;
    groups.set(result.suiteId, current);
  }

  return [...groups.entries()]
    .map(([suiteId, value]) => ({ suiteId, ...value }))
    .sort((left, right) => left.label.localeCompare(right.label));
};

export default function AdminTestPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [catalog, setCatalog] = useState<AdminTestSuite[]>([]);
  const [reports, setReports] = useState<AdminTestReport[]>([]);
  const [activeReport, setActiveReport] = useState<AdminTestReport | null>(null);
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(Boolean(getAdminTestSession().accessToken));
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const totals = useMemo(() => {
    const totalSuites = catalog.length;
    const totalCases = catalog.reduce((sum, suite) => sum + suite.caseCount, 0);
    const totalAiCases = catalog.reduce(
      (sum, suite) => sum + suite.cases.filter((testCase) => testCase.ai).length,
      0,
    );

    return { totalSuites, totalCases, totalAiCases };
  }, [catalog]);

  const selectedCatalog = useMemo(
    () => catalog.filter((suite) => selectedSuites.includes(suite.id)),
    [catalog, selectedSuites],
  );

  const selectedStats = useMemo(() => {
    const suiteCount = selectedCatalog.length;
    const caseCount = selectedCatalog.reduce((sum, suite) => sum + suite.caseCount, 0);
    const aiCaseCount = selectedCatalog.reduce(
      (sum, suite) => sum + suite.cases.filter((testCase) => testCase.ai).length,
      0,
    );

    return {
      suiteCount,
      caseCount,
      aiCaseCount,
      hasAi: aiCaseCount > 0,
    };
  }, [selectedCatalog]);

  const visibleCatalog = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return catalog;
    }

    return catalog.filter((suite) => {
      const suiteText = [
        suite.label,
        suite.description,
        ...suite.cases.flatMap((testCase) => [
          testCase.label,
          testCase.method,
          testCase.path,
          testCase.role,
          testCase.ai ? "ai" : "safe",
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return suiteText.includes(query);
    });
  }, [catalog, searchTerm]);

  const visibleReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return reports;
    }

    return reports.filter((report) => {
      const reportText = [
        report.title,
        report.status,
        report.mode,
        report.createdBy,
        report.summary.suiteLabels?.join(" "),
        report.results
          .map((result) => [result.label, result.method, result.path, result.role, result.message].join(" "))
          .join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return reportText.includes(query);
    });
  }, [reports, searchTerm]);

  const activeReportGroups = useMemo(
    () => groupReportResults(activeReport),
    [activeReport],
  );

  const focusDetails = () => {
    detailsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const hydrateDashboard = async ({
    keepSelection = true,
    activeReportId,
  }: {
    keepSelection?: boolean;
    activeReportId?: string | null;
  } = {}) => {
    setPageLoading(true);

    try {
      const [suiteData, reportData] = await Promise.all([
        fetchAdminTestCatalog(),
        fetchAdminTestReports(),
      ]);

      setCatalog(suiteData);
      setReports(reportData);
      setSelectedSuites((current) => {
        if (!keepSelection || current.length === 0) {
          return suiteData.map((suite) => suite.id);
        }

        return current.filter((id) => suiteData.some((suite) => suite.id === id));
      });

      const nextActiveId =
        activeReportId === undefined
          ? activeReport?.id || reportData[0]?.id || null
          : activeReportId;

      if (!nextActiveId) {
        setActiveReport(reportData[0] || null);
        return;
      }

      setActiveReport(reportData.find((report) => report.id === nextActiveId) || reportData[0] || null);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      setPageLoading(false);
      return;
    }

    hydrateDashboard({ keepSelection: false, activeReportId: null }).catch(() => {
      clearAdminTestSession();
      setIsSignedIn(false);
      toast.error("Admin session expired. Please sign in again.");
    });
  }, [isSignedIn]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);

    try {
      await adminTestLogin(username, password);
      setIsSignedIn(true);
      toast.success("Admin test console unlocked.");
    } catch {
      toast.error("Admin login failed. Confirm the seeded admin account exists.");
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleSuite = (suiteId: string) => {
    setSelectedSuites((current) =>
      current.includes(suiteId)
        ? current.filter((id) => id !== suiteId)
        : [...current, suiteId],
    );
  };

  const selectAllSuites = () => {
    setSelectedSuites(catalog.map((suite) => suite.id));
  };

  const clearSuiteSelection = () => {
    setSelectedSuites([]);
  };

  const runSweep = async (includeAi: boolean, suiteIds = selectedSuites) => {
    if (!suiteIds.length) {
      toast.error("Select at least one suite before starting a run.");
      return;
    }

    setRunLoading(true);
    try {
      const report = await runAdminTestSuites(suiteIds, includeAi);
      setReports((current) => [report, ...current.filter((item) => item.id !== report.id)]);
      setActiveReport(report);
      focusDetails();
      toast.success(
        `${includeAi ? "Full AI" : "Safe"} sweep completed with ${report.summary.caseCount} cases across ${report.summary.suiteCount} suites.`,
      );
      await hydrateDashboard({ activeReportId: report.id });
    } catch {
      toast.error("The admin sweep failed to complete.");
    } finally {
      setRunLoading(false);
    }
  };

  const openReport = async (report: AdminTestReport) => {
    setActiveReport(report);
    focusDetails();

    if (activeReport?.id === report.id) {
      return;
    }

    setReportLoading(true);
    try {
      const freshReport = await fetchAdminTestReport(report.id);
      setActiveReport(freshReport);
      focusDetails();
    } catch {
      toast.error("Unable to load that report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleOpenPdf = async (reportId: string) => {
    setPdfLoadingId(reportId);
    try {
      await openAdminTestReportPdf(reportId);
    } catch {
      toast.error("PDF preview failed to open.");
    } finally {
      setPdfLoadingId(null);
    }
  };

  const handleDownload = async (reportId: string) => {
    setDownloadLoadingId(reportId);
    try {
      await downloadAdminTestReport(reportId);
      toast.success("PDF download started.");
    } catch {
      toast.error("PDF download failed.");
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleLogout = () => {
    clearAdminTestSession();
    setCatalog([]);
    setReports([]);
    setActiveReport(null);
    setSelectedSuites([]);
    setIsSignedIn(false);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_32%),linear-gradient(135deg,#07111f_0%,#0f1d31_48%,#101827_100%)] text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6">
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <ShieldCheck size={16} />
                Production Validation Console
              </div>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  Validate backend, engine, and client wiring from one admin panel.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Safe sweeps cover the platform without spending AI quota. AI sweeps are exposed
                  only when the chosen suites really contain engine-backed cases.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-sm text-slate-400">Access route</p>
                  <p className="mt-2 text-lg font-semibold text-white">/admin-test</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-sm text-slate-400">Seeded login</p>
                  <p className="mt-2 text-lg font-semibold text-white">admin / admin</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-sm text-slate-400">Run modes</p>
                  <p className="mt-2 text-lg font-semibold text-white">Safe and AI</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                  <Lock size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Admin Sign In</p>
                  <h2 className="text-2xl font-semibold text-white">Unlock the test cockpit</h2>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                    <User2 size={16} />
                    Username
                  </span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                    <Lock size={16} />
                    Password
                  </span>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </label>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {authLoading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {authLoading ? "Checking credentials..." : "Enter admin-test"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#07111f_0%,#0a1424_45%,#111827_100%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80 sm:text-sm">
              Admin Test Console
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Validation sweeps, PDF evidence, and clean report review
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => hydrateDashboard()}
              disabled={pageLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw size={16} className={pageLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Suites published</p>
            <p className="mt-2 text-3xl font-semibold text-white">{totals.totalSuites}</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Cases published</p>
            <p className="mt-2 text-3xl font-semibold text-white">{totals.totalCases}</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">AI-backed cases</p>
            <p className="mt-2 text-3xl font-semibold text-white">{totals.totalAiCases}</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Selected right now</p>
            <p className="mt-2 text-3xl font-semibold text-white">{selectedStats.suiteCount}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex flex-col gap-5">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <Search size={18} className="text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search suites, test cases, report titles, paths, or roles"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </label>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold text-white">Run validation sweeps</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Safe sweeps exercise regular platform flows. AI sweeps appear only when your
                      selected suites actually include engine-backed cases such as journal analysis,
                      reconciliation analysis, forecasting, OCR, or copilot.
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[18rem]">
                    <button
                      type="button"
                      onClick={selectAllSuites}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 transition hover:bg-white/10"
                    >
                      Select all suites
                    </button>
                    <button
                      type="button"
                      onClick={clearSuiteSelection}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 transition hover:bg-white/10"
                    >
                      Clear selection
                    </button>
                    <button
                      type="button"
                      onClick={() => runSweep(false)}
                      disabled={runLoading || !selectedSuites.length}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {runLoading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                      Run safe sweep
                    </button>
                    {selectedStats.hasAi ? (
                      <button
                        type="button"
                        onClick={() => runSweep(true)}
                        disabled={runLoading || !selectedSuites.length}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Bot size={16} />
                        Run AI sweep
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-sm text-slate-400">Current selection</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {selectedStats.suiteCount} suites, {selectedStats.caseCount} cases
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {selectedStats.aiCaseCount} AI-backed cases in scope
                    </p>
                  </div>
                </div>

                {pageLoading ? (
                  <div className="rounded-[1.75rem] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">
                    Loading suites...
                  </div>
                ) : visibleCatalog.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">
                    No suites match that search.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {visibleCatalog.map((suite) => {
                      const selected = selectedSuites.includes(suite.id);
                      const aiCount = suite.cases.filter((testCase) => testCase.ai).length;

                      return (
                        <div
                          key={suite.id}
                          className={`min-w-0 rounded-[1.75rem] border p-4 transition ${
                            selected
                              ? "border-cyan-300/35 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]"
                              : "border-white/10 bg-slate-950/40"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleSuite(suite.id)}
                              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                                selected
                                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                                  : "border-white/20 bg-transparent text-transparent"
                              }`}
                              aria-label={`Toggle ${suite.label}`}
                            >
                              <CheckCircle2 size={14} />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-white">{suite.label}</h3>
                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                                  {suite.caseCount} cases
                                </span>
                                {suite.includesAi ? (
                                  <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-200">
                                    {aiCount} AI
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                                    Safe only
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{suite.description}</p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => runSweep(false, [suite.id])}
                              disabled={runLoading}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Run safe report
                            </button>
                            {suite.includesAi ? (
                              <button
                                type="button"
                                onClick={() => runSweep(true, [suite.id])}
                                disabled={runLoading}
                                className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Run AI report
                              </button>
                            ) : (
                              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-slate-400">
                                No AI endpoints in this suite.
                              </div>
                            )}
                          </div>

                          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                            {suite.cases.map((testCase) => (
                              <div
                                key={testCase.id}
                                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-100">
                                    {testCase.method}
                                  </span>
                                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300">
                                    {testCase.role}
                                  </span>
                                  {testCase.ai ? (
                                    <span className="rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200">
                                      AI
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-sm font-medium text-white">{testCase.label}</p>
                                <p className="mt-1 break-words text-xs leading-6 text-slate-400">
                                  {testCase.path}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold text-white">Report archive</h2>
                </div>
                <Activity className="mt-1 shrink-0 text-cyan-200" />
              </div>

              <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {visibleReports.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-white/10 px-5 py-12 text-center text-slate-400">
                    {searchTerm.trim()
                      ? "No reports match that search."
                      : "No reports yet. Run a sweep to generate the first archive."}
                  </div>
                ) : (
                  visibleReports.map((report) => {
                    const reportSuites = getReportSuiteLabels(report);
                    const isActive = activeReport?.id === report.id;
                    const executedCaseCount =
                      report.summary.executedCaseCount ??
                      report.summary.passed + report.summary.failed;

                    return (
                      <div
                        key={report.id}
                        className={`min-w-0 rounded-[1.75rem] border p-4 transition ${
                          isActive
                            ? "border-cyan-300/40 bg-cyan-400/10"
                            : "border-white/10 bg-slate-950/40"
                        }`}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white">{report.title}</p>
                              <p className="mt-1 text-sm text-slate-400">
                                {formatDateTime(report.createdAt)}
                              </p>
                              <p className="mt-2 break-words text-xs uppercase tracking-[0.18em] text-slate-500">
                                {reportSuites.join(" / ")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusClassMap[report.status] || "bg-white/10 text-white"}`}>
                                {report.status}
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusClassMap[report.mode] || "bg-white/10 text-white"}`}>
                                {report.mode}
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-5">
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs text-slate-400">Suites</p>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {report.summary.suiteCount}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs text-slate-400">Cases</p>
                              <p className="mt-1 text-sm font-semibold text-white">
                                {report.summary.caseCount}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs text-slate-400">Executed</p>
                              <p className="mt-1 text-sm font-semibold text-cyan-100">
                                {executedCaseCount}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs text-slate-400">Failed</p>
                              <p className="mt-1 text-sm font-semibold text-rose-200">
                                {report.summary.failed}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-white/5 px-3 py-2">
                              <p className="text-xs text-slate-400">Skipped</p>
                              <p className="mt-1 text-sm font-semibold text-amber-200">
                                {report.summary.skipped}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openReport(report)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                            >
                              <Eye size={15} />
                              {isActive ? "Open current details" : "Open details"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPdf(report.id)}
                              disabled={pdfLoadingId === report.id}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {pdfLoadingId === report.id ? (
                                <RefreshCw className="animate-spin" size={15} />
                              ) : (
                                <FileText size={15} />
                              )}
                              Open PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(report.id)}
                              disabled={downloadLoadingId === report.id}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {downloadLoadingId === report.id ? (
                                <RefreshCw className="animate-spin" size={15} />
                              ) : (
                                <FileDown size={15} />
                              )}
                              Download PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div ref={detailsRef} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold text-white">Run details</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Review the exact suite mix, the per-case outcomes, and the response snippets
                    that were written into the technical PDF report.
                  </p>
                </div>
                {reportLoading ? (
                  <RefreshCw className="animate-spin text-cyan-200" />
                ) : (
                  <CheckCircle2 className="text-cyan-200" />
                )}
              </div>

              {!activeReport ? (
                <div className="rounded-[1.75rem] border border-dashed border-white/10 px-5 py-12 text-center text-slate-400">
                  Pick a report to inspect its case-level results.
                </div>
              ) : (
                <div className="min-w-0 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusClassMap[activeReport.status] || "bg-white/10 text-white"}`}>
                      {activeReport.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${statusClassMap[activeReport.mode] || "bg-white/10 text-white"}`}>
                      {activeReport.mode}
                    </span>
                    {getReportSuiteLabels(activeReport).map((label) => (
                      <span
                        key={`${activeReport.id}-${label}`}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Pass rate</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {activeReport.summary.successRate}%
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Elapsed time</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {formatDuration(activeReport.summary.totalDurationMs)}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">Executed</p>
                      <p className="mt-2 text-3xl font-semibold text-cyan-100">
                        {activeReport.summary.executedCaseCount ??
                          activeReport.summary.passed + activeReport.summary.failed}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-sm text-slate-400">AI cases in scope</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {activeReport.summary.aiCaseCount ?? activeReport.results.filter((result) => result.ai).length}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4 text-sm leading-7 text-slate-300">
                    <p>
                      <span className="text-slate-400">Started:</span> {formatDateTime(activeReport.startedAt)}
                    </p>
                    <p>
                      <span className="text-slate-400">Finished:</span> {formatDateTime(activeReport.finishedAt)}
                    </p>
                    <p>
                      <span className="text-slate-400">Created by:</span> {activeReport.createdBy}
                    </p>
                    <p>
                      <span className="text-slate-400">Cases in this report:</span> {activeReport.summary.caseCount}
                    </p>
                    <p>
                      <span className="text-slate-400">Skipped for quota protection:</span> {activeReport.summary.skipped}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPdf(activeReport.id)}
                      disabled={pdfLoadingId === activeReport.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pdfLoadingId === activeReport.id ? (
                        <RefreshCw className="animate-spin" size={15} />
                      ) : (
                        <FileText size={15} />
                      )}
                      Open this PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(activeReport.id)}
                      disabled={downloadLoadingId === activeReport.id}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloadLoadingId === activeReport.id ? (
                        <RefreshCw className="animate-spin" size={15} />
                      ) : (
                        <FileDown size={15} />
                      )}
                      Download this PDF
                    </button>
                  </div>

                  <div className="max-h-[44rem] space-y-4 overflow-y-auto pr-1">
                    {activeReportGroups.map((group) => (
                      <div
                        key={`${activeReport.id}-${group.suiteId}`}
                        className="min-w-0 rounded-[1.6rem] border border-white/10 bg-slate-950/35 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-white">{group.label}</h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {group.results.length} cases in this suite section
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
                              {group.passed} passed
                            </span>
                            <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-rose-200">
                              {group.failed} failed
                            </span>
                            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
                              {group.skipped} skipped
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {group.results.map((result) => {
                            const Icon = resultIconMap[result.status];

                            return (
                              <div
                                key={`${activeReport.id}-${result.id}`}
                                className="min-w-0 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Icon
                                      className={
                                        result.status === "passed"
                                          ? "text-emerald-300"
                                          : result.status === "failed"
                                            ? "text-rose-300"
                                            : "text-amber-300"
                                      }
                                      size={16}
                                    />
                                    <span className="font-medium text-white">{result.label}</span>
                                    <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                                      {result.method}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                                      {result.role}
                                    </span>
                                    {result.ai ? (
                                      <span className="rounded-full bg-amber-400/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200">
                                        AI
                                      </span>
                                    ) : null}
                                    <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${resultClassMap[result.status]}`}>
                                      {result.status}
                                    </span>
                                  </div>

                                  <p className="break-words text-sm leading-6 text-slate-400">
                                    {result.path}
                                  </p>
                                  <p className="text-sm leading-6 text-slate-200">{result.message}</p>

                                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                                    <span>Duration: {formatDuration(result.durationMs)}</span>
                                    {result.statusCode ? <span>Status: {result.statusCode}</span> : null}
                                    <span>Suite: {result.suiteLabel}</span>
                                  </div>

                                  {result.responsePreview ? (
                                    <details className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                      <summary className="cursor-pointer text-sm font-medium text-slate-200">
                                        Response preview
                                      </summary>
                                      <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                                        {result.responsePreview}
                                      </pre>
                                    </details>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
