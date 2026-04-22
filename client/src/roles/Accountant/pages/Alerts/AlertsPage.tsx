import { useEffect, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Info, Loader2, RefreshCw } from "lucide-react";
import { accountantApi } from "../../services/accountant.api";

interface AlertItem {
  id: string;
  message: string;
  severity: string;
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const response = await accountantApi.getDashboardStats();
        setAlerts(response.alerts || []);
      } catch (error) {
        console.error("Failed to fetch alerts from dashboard service", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [refreshTick]);

  const summary = useMemo(() => {
    return {
      total: alerts.length,
      high: alerts.filter((alert) => alert.severity === "high").length,
      medium: alerts.filter((alert) => alert.severity === "medium").length,
      low: alerts.filter((alert) => alert.severity === "low").length,
    };
  }, [alerts]);

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          shell: "border-rose-200 bg-rose-50 text-rose-900",
          icon: <AlertTriangle size={18} className="text-rose-600" />,
          label: "High",
        };
      case "medium":
        return {
          shell: "border-amber-200 bg-amber-50 text-amber-900",
          icon: <AlertCircle size={18} className="text-amber-600" />,
          label: "Medium",
        };
      default:
        return {
          shell: "border-sky-200 bg-sky-50 text-sky-900",
          icon: <Info size={18} className="text-sky-600" />,
          label: "Low",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-[#1D4ED8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Alerts</h1>
          </div>

          <button
            type="button"
            onClick={() => setRefreshTick((tick) => tick + 1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={15} />
            Refresh alerts
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-rose-700">High</p>
            <p className="mt-2 text-2xl font-semibold text-rose-900">{summary.high}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Medium</p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">{summary.medium}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Low</p>
            <p className="mt-2 text-2xl font-semibold text-sky-900">{summary.low}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            No alerts right now.
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getAlertStyle(alert.severity);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-[1.5rem] border p-4 ${style.shell}`}
              >
                <div className="mt-0.5">{style.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{style.label}</p>
                  <p className="mt-1 text-sm leading-6">{alert.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
