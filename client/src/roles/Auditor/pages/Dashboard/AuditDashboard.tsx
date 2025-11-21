import KPIWidget from "../../../../components/Dashboard/KPIWidget";
import TaskSummary from "../../../../components/Dashboard/TaskSummary";
import ReconcileStatusCard from "../../../../components/Dashboard/ReconcileStatusCard";
import AlertsSummary from "../../../../components/Dashboard/AlertsSummary";

const AccountantDashboard = () => {
  // Dummy data (replace with API later)
  const pendingTasks = [
    { title: "Accrual Adjustments", count: 5, path: "/accountant/tasks/accruals" },
    { title: "Tax Adjustments", count: 2, path: "/accountant/tasks/tax" },
  ];

  const alerts: { id: string; message: string; severity: "high" | "medium" | "low" }[] = [
    { id: "1", message: "Invoice #123 missing GL code", severity: "high" },
    { id: "2", message: "Bank reconciliation variance detected", severity: "medium" },
    { id: "3", message: "Vendor payment delay", severity: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPIWidget title="Pending Tasks" value={7} />
        <KPIWidget title="Bank Reconciliations" value={3} />
        <KPIWidget title="Vendor Reconciliations" value={5} />
        <KPIWidget title="Alerts" value={3} />
        <KPIWidget title="Journal Validation Failures" value={1} />
      </div>

      {/* Pending Tasks & Reconciliation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskSummary tasks={pendingTasks} />
        <div className="space-y-2">
          <ReconcileStatusCard type="bank" pending={3} />
          <ReconcileStatusCard type="vendor" pending={5} />
        </div>
      </div>

      {/* Alerts */}
      <AlertsSummary alerts={alerts} />
    </div>
  );
};

export default AccountantDashboard;