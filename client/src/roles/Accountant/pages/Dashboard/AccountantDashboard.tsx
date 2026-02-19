/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import KPIWidget from "../../../../components/Dashboard/KPIWidget";
import TaskSummary from "../../../../components/Dashboard/TaskSummary";
import ReconcileStatusCard from "../../../../components/Dashboard/ReconcileStatusCard";
import AlertsSummary from "../../../../components/Dashboard/AlertsSummary";
import { accountantApi } from "../../services/accountant.api";

const AccountantDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await accountantApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="p-6">Loading Dashboard...</div>;

  
  const kpi = stats?.kpi || { totalPendingTasks: 0, accrualTasks: 0, taxTasks: 0, pendingJournals: 0, validationFailures: 0 };
  const alertList = stats?.alerts || [];

  
  const pendingTasksList = [
    { title: "Accrual Adjustments", count: kpi.accrualTasks, path: "/accountant/tasks/accruals" },
    { title: "Tax Adjustments", count: kpi.taxTasks, path: "/accountant/tasks/tax" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPIWidget title="Pending Tasks" value={kpi.totalPendingTasks} />
        <KPIWidget title="Pending Journals" value={kpi.pendingJournals} /> 
        <KPIWidget title="Bank Reconciliations" value={kpi.bankReconciliations} />
        <KPIWidget title="Vendor Reconciliations" value={kpi.vendorReconciliations} />
        <KPIWidget title="Risk Alerts" value={alertList.length} />
      </div>

      {/* Charts & Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskSummary tasks={pendingTasksList} />
        <div className="space-y-2">
          <ReconcileStatusCard type="bank" pending={kpi.bankReconciliations} />
          <ReconcileStatusCard type="vendor" pending={kpi.vendorReconciliations} />
        </div>
      </div>

      {/* Alerts Section */}
      <AlertsSummary alerts={alertList} />
    </div>
  );
};

export default AccountantDashboard;