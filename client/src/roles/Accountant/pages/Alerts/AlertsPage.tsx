import { useState, useEffect } from "react";
import api from "../../../../lib/api";
import { Loader2, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface Alert {
  id: string;
  message: string;
  severity: string;
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Hitting your NestJS DashboardController
        const response = await api.get('/dashboard/accountant');
        // The service returns { kpi: {...}, alerts: [...] }
        setAlerts(response.data.alerts);
      } catch (error) {
        console.error("Failed to fetch alerts from dashboard service", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case "high": return { bg: "bg-red-100", text: "text-red-800", icon: <AlertTriangle size={18} className="text-red-600"/> };
      case "medium": return { bg: "bg-yellow-100", text: "text-yellow-800", icon: <AlertCircle size={18} className="text-yellow-600"/> };
      default: return { bg: "bg-blue-100", text: "text-blue-800", icon: <Info size={18} className="text-blue-600"/> };
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#1D4ED8]" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alerts</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        {alerts.length === 0 ? (
          <p className="text-gray-500">No active alerts. All journals are compliant.</p>
        ) : (
          alerts.map((alert) => {
            const style = getAlertStyle(alert.severity);
            return (
              <div key={alert.id} className={`p-4 rounded-lg flex items-center gap-3 ${style.bg} ${style.text}`}>
                {style.icon}
                <span className="font-medium">{alert.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsPage;