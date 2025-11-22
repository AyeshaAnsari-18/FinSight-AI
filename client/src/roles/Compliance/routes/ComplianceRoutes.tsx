import { Routes, Route } from "react-router-dom";
import ComplianceDashboard from "../pages/Dashboard/ComplianceDashboard";
import DeptClearancePanel from "../pages/Clearance/DeptClearancePanel";
import MonitoringOverview from "../pages/ComplianceMonitoring/MonitoringOverview";
import RedFlags from "../pages/ComplianceMonitoring/RedFlags";
import ControlEvidence from "../pages/Controls/ControlEvidence";
import ControlTesting from "../pages/Controls/ControlTesting";
import InternalControls from "../pages/Controls/InternalControls";
import ComplianceCopilot from "../pages/Copilot/ComplianceCopilot";
import AllPolicies from "../pages/Policies/AllPolicies";
import PolicyDetails from "../pages/Policies/PolicyDetails";
import PolicyViolations from "../pages/Policies/PolicyViolations";
import ComplianceReports from "../pages/Regulatory/ComplianceReports";
import RegulatoryRequirements from "../pages/Regulatory/RegulatoryRequirements";

const ComplianceRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ComplianceDashboard />} />
      <Route path="/dept-clearance" element={<DeptClearancePanel />} />
      <Route path="/monitoring-overview" element={<MonitoringOverview />} />
      <Route path="/red-flags" element={<RedFlags />} />
      <Route path="/control-evidence" element={<ControlEvidence />} />
      <Route path="/control-testing" element={<ControlTesting />} />
      <Route path="/internal-controls" element={<InternalControls />} />
      <Route path="/policies" element={<AllPolicies />} />
      <Route path="/policy-details" element={<PolicyDetails />} />
      <Route path="/policy-violations" element={<PolicyViolations />} />
      <Route path="/reports" element={<ComplianceReports />} />
      <Route path="/regulatory-requirements" element={<RegulatoryRequirements />} />
      <Route path="/copilot" element={<ComplianceCopilot />} />
    </Routes>
  );
};

export default ComplianceRoutes;
