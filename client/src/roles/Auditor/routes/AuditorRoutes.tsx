import { Routes, Route } from "react-router-dom";
import AccountantDashboard from "../pages/Dashboard/AccountantDashboard";

// All other pages (disabled for now)
import UploadPage from "../pages/Upload/UploadPage";
import AccrualsPage from "../pages/Tasks/AccrualsPage";
import TaxAdjustmentPage from "../pages/Tasks/TaxAdjustmentPage";
import BankReconcilePage from "../pages/Reconcile/BankReconcilePage";
import VendorReconcilePage from "../pages/Reconcile/VendorReconcilePage";
import JournalEntriesPage from "../pages/Journals/JournalEntriesPage";
import AlertsPage from "../pages/Alerts/AlertsPage";
import MyReportsPage from "../pages/Reports/MyReportsPage";
import CopilotPage from "../pages/Copilot/CopilotPage";

const AccountantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountantDashboard />} />
      <Route path="alerts" element={<AlertsPage />} />
      <Route path="copilot" element={<CopilotPage />} />
      <Route path="reports" element={<MyReportsPage />} />
      <Route path="journals" element={<JournalEntriesPage />} />
      <Route path="upload" element={<UploadPage />} />
      <Route path="tasks/accruals" element={<AccrualsPage />} />
      <Route path="tasks/tax" element={<TaxAdjustmentPage />} />
      <Route path="reconcile/bank" element={<BankReconcilePage />} />
      <Route path="reconcile/vendor" element={<VendorReconcilePage />} />
    </Routes>
  );
};

export default AccountantRoutes;
