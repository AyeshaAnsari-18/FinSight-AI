import { Routes, Route } from "react-router-dom";
import AccountantDashboard from "../pages/Dashboard/AccountantDashboard";

import UploadPage from "../pages/Upload/UploadPage";
import AccrualsPage from "../pages/Tasks/AccrualsPage";
import TaxAdjustmentPage from "../pages/Tasks/TaxAdjustmentPage";
import BankReconcilePage from "../pages/Reconcile/BankReconcilePage";
import VendorReconcilePage from "../pages/Reconcile/VendorReconcilePage";
import JournalEntriesPage from "../pages/Journals/JournalEntriesPage";
import AlertsPage from "../pages/Alerts/AlertsPage";
import MyReportsPage from "../pages/Reports/MyReportsPage";
import InvoiceViewerPage from "../pages/Reports/InvoiceViewerPage";
import CopilotPage from "../pages/Copilot/CopilotPage";
import SearchPage from "../../../Pages/search/SearchPage";

const AccountantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountantDashboard />} />
      <Route path="alerts" element={<AlertsPage />} />
      <Route path="copilot" element={<CopilotPage />} />
      <Route path="reports" element={<MyReportsPage />} />
      <Route path="reports/:id/invoice" element={<InvoiceViewerPage />} />
      <Route path="journals" element={<JournalEntriesPage />} />
      <Route path="upload" element={<UploadPage />} />
      <Route path="tasks/accruals" element={<AccrualsPage />} />
      <Route path="tasks/tax" element={<TaxAdjustmentPage />} />
      <Route path="reconcile/bank" element={<BankReconcilePage />} />
      <Route path="reconcile/vendor" element={<VendorReconcilePage />} />
      <Route path="search" element={<SearchPage />} />
    </Routes>
  );
};

export default AccountantRoutes;
