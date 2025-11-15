import { Routes, Route } from "react-router-dom";
import AccountantDashboard from "../pages/Dashboard/AccountantDashboard";

// All other pages (disabled for now)
// import UploadPage from "../pages/Upload/UploadPage";
// import AccrualsPage from "../pages/Tasks/AccrualsPage";
// import TaxAdjustmentsPage from "../pages/Tasks/TaxAdjustmentPage";
// import BankReconcilePage from "../pages/Reconcile/BankReconcilePage";
// import VendorReconcilePage from "../pages/Reconcile/VendorReconcilePage";
// import JournalEntriesPage from "../pages/Journals/JournalEntriesPage";
// import AlertsPage from "../pages/Alerts/AlertsPage";
// import MyReportsPage from "../pages/Reports/MyReportsPage";
// import CopilotPage from "../pages/Copilot/CopilotPage";

const AccountantRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AccountantDashboard />} />

      {/* Future routes here */}
    </Routes>
  );
};

export default AccountantRoutes;
