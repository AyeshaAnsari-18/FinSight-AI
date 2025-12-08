import { Routes, Route } from "react-router-dom";
import ManagerDashboard from "../pages/Dashboard/ManagerDashboard";
import AuditTrail from "../pages/AuditTrail/AuditTrail";
import ComplianceOverview from "../pages/Compliance/ComplianceOverview";
import ManagerCopilot from "../pages/Copilot/ManagerCopilot"
import DepartmentsOverview from "../pages/Departments/DepartmentsOverview";
import FiscalCloseAgent from "../pages/FiscalClose/FiscalCloseAgent";
import FiscalCloseMain from "../pages/FiscalClose/FiscalCloseMain";
import ForecastScenarios from "../pages/Forecast/ForecastScenarios";
import WhatIfAnalysis from "../pages/Forecast/WhatIfAnalysis";
import NarrativeReports from "../pages/Narratives/NarrativeReports";
import ManagerTasks from "../pages/Tasks/ManagerTasks";

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerDashboard />} />
      <Route path="/auditTrail" element={<AuditTrail />} />
      <Route path="/complianceOverview" element={<ComplianceOverview />} />
      <Route path="/managerCopilot" element={<ManagerCopilot />} />
      <Route path="/departmentsOverview" element={<DepartmentsOverview />} />
      <Route path="/fiscalCloseAgent" element={<FiscalCloseAgent />} />
      <Route path="/fiscalCloseMain" element={<FiscalCloseMain />} />
      <Route path="/forecastScenarios" element={<ForecastScenarios />} />
      <Route path="/whatIfAnalysis" element={<WhatIfAnalysis />} />
      <Route path="/narrativeReports" element={<NarrativeReports />} />
      <Route path="/managerTasks" element={<ManagerTasks />} />
    </Routes>
  );
};

export default ManagerRoutes;
