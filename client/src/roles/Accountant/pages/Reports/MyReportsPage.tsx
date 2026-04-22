import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, FileText, Loader2, RefreshCw, Search } from "lucide-react";
import { narrativesApi } from "../../../Manager/services/narratives.api";

interface NarrativeReport {
  id: string;
  title: string;
  period: string;
  content: string;
  createdAt: string;
  author: string;
  status: string;
  fileType: string;
  recordId: string;
  invoiceUrl: string;
  reportUrl: string;
  downloadUrl: string;
  invoiceAvailable?: boolean;
  reportAvailable?: boolean;
}

const MyReportsPage = () => {
  const [reports, setReports] = useState<NarrativeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await narrativesApi.getReports(search.trim() || undefined);
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [search, refreshTick]);

  const summary = useMemo(() => {
    return {
      total: reports.length,
      completed: reports.filter((report) => report.status === "Completed").length,
      draft: reports.filter((report) => report.status !== "Completed").length,
    };
  }, [reports]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">My Reports</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRefreshTick((tick) => tick + 1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total reports</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900">{summary.completed}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Draft</p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">{summary.draft}</p>
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by report title, summary, or file type"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {loading ? (
          <div className="flex items-center justify-center rounded-[2rem] border border-white/10 bg-white p-10 text-slate-500">
            <Loader2 className="animate-spin text-[#1D4ED8]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 xl:col-span-2">
            No reports matched your search.
          </div>
        ) : (
          reports.map((report) => (
            <article
              key={report.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText size={18} className="text-[#1D4ED8]" />
                    <h2 className="truncate text-lg font-semibold text-slate-900">{report.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {report.author} - {report.period} - {report.fileType}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    report.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <p className="mt-4 max-h-20 overflow-hidden text-sm leading-6 text-slate-600">
                {report.content}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {report.invoiceAvailable && report.recordId ? (
                  <Link
                    to={`/accountant/reports/${report.recordId}/invoice`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    View invoice
                    <ExternalLink size={15} />
                  </Link>
                ) : null}

                {report.reportAvailable && report.reportUrl ? (
                  <a
                    href={report.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e40af]"
                  >
                    Open generated report
                    <ExternalLink size={15} />
                  </a>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;
