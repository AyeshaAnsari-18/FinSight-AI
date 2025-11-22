import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccountantLayout from "./roles/Accountant/layout/AccountantLayout";
import AccountantRoutes from "./roles/Accountant/routes/AccountantRoutes";

import AuditorLayout from "./roles/Auditor/layout/AuditorLayout";
import AuditorRoutes from "./roles/Auditor/routes/AuditorRoutes";

import ComplianceLayout from "./roles/Compliance/layout/ComplianceLayout"
import ComplianceRoutes from "./roles/Compliance/routes/ComplianceRoutes";

import ManagerLayout from "./roles/Manager/layout/ManagerLayout";
import ManagerRoutes from "./roles/Manager/routes/ManagerRoutes";


type UserRole = "accountant" | "auditor" | "manager" | "compliance";

function App() {
  const role: UserRole = "manager";

  const isAccountant = (r: UserRole) => r === "accountant";
  const isAuditor = (r: UserRole) => r === "auditor";
  const isCompliance = (r: UserRole) => r === "compliance";
  const isManager = (r: UserRole) => r === "manager";

  return (
    <BrowserRouter>
      <Routes>

        {/* ACCOUNTANT */}
        {isAccountant(role) && (
          <Route path="/*" element={<AccountantLayout />}>
            <Route path="accountant/*" element={<AccountantRoutes />} />
          </Route>
        )}

        {/* AUDITOR */}
        {isAuditor(role) && (
          <Route path="/*" element={<AuditorLayout />}>
            <Route path="auditor/*" element={<AuditorRoutes />} />
          </Route>
        )}

        {/* COMPLIANCE */}
        {isCompliance(role) && (
          <Route path="/*" element={<ComplianceLayout />}>
            <Route path="compliance/*" element={<ComplianceRoutes />} />
          </Route>
        )}

        {/* MANAGER */}
        {isManager(role) && (
          <Route path="/*" element={<ManagerLayout />}>
            <Route path="manager/*" element={<ManagerRoutes />} />
          </Route>
        )}
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
