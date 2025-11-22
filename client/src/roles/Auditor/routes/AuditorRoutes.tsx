import { Routes, Route } from "react-router-dom";
import AuditorDashboard from "../pages/Dashboard/AuditDashboard";
import AuditTrailPage from "../pages/AuditTrail/FullAuditTrail";
import ClearancePanel from "../pages/Clearance/ClearancePanel";
import AuditComplianceCheck from "../pages/Compliance/AuditComplianceCheck";
import DepartmentAuditOverview from "../pages/DeptOverview/DepartmentAuditOverview";
import FlagsAndRedAlerts from "../pages/Flags/FlagsAndRedAlerts";
import JournalsDetails from "../pages/Journals/JournalsDetails";
import JournalsExceptions from "../pages/Journals/JournalsExceptions";
import JournalsReview from "../pages/Journals/JournalsReview";
import ReconciliationIssues from "../pages/Reconciliations/ReconciliationIssues";
import ReconciliationReview from "../pages/Reconciliations/ReconciliationReview";
import TaskAuditView from "../pages/Tasks/TasksAuditView";
import CopilotPage from "../pages/Copilot/AuditorCopilot";

const AuditorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuditorDashboard />} />
      <Route path="auditTrail" element={<AuditTrailPage />} />
      <Route path="clearance" element={<ClearancePanel />} />
      <Route path="compliance" element={<AuditComplianceCheck />} />
      <Route path="department-overview" element={<DepartmentAuditOverview />} />
      <Route path="flags" element={<FlagsAndRedAlerts />} />
      <Route path="journals/details" element={<JournalsDetails />} />
      <Route path="journals/exceptions" element={<JournalsExceptions />} />
      <Route path="journals/review" element={<JournalsReview />} />
      <Route path="reconciliations/issues" element={<ReconciliationIssues />} />
      <Route path="reconciliations/review" element={<ReconciliationReview />} />
      <Route path="tasks/view" element={<TaskAuditView />} />
      <Route path="copilot" element={<CopilotPage />} />
    </Routes>
  );
};

export default AuditorRoutes;
