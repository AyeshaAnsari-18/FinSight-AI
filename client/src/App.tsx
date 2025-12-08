{/*}
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
        {/*}
        {isAccountant(role) && (
          <Route path="/*" element={<AccountantLayout />}>
            <Route path="accountant/*" element={<AccountantRoutes />} />
          </Route>
        )}

        {/* AUDITOR */}
        {/*}
        {isAuditor(role) && (
          <Route path="/*" element={<AuditorLayout />}>
            <Route path="auditor/*" element={<AuditorRoutes />} />
          </Route>
        )}

        {/* COMPLIANCE */}
        {/*}
        {isCompliance(role) && (
          <Route path="/*" element={<ComplianceLayout />}>
            <Route path="compliance/*" element={<ComplianceRoutes />} />
          </Route>
        )}

        {/* MANAGER */}
        {/*}
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
*/}

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/login/Page";

// Layouts
import AccountantLayout from "./roles/Accountant/layout/AccountantLayout";
import AuditorLayout from "./roles/Auditor/layout/AuditorLayout";
import ComplianceLayout from "./roles/Compliance/layout/ComplianceLayout";
import ManagerLayout from "./roles/Manager/layout/ManagerLayout";

// Role Routes
import AccountantRoutes from "./roles/Accountant/routes/AccountantRoutes";
import AuditorRoutes from "./roles/Auditor/routes/AuditorRoutes";
import ComplianceRoutes from "./roles/Compliance/routes/ComplianceRoutes";
import ManagerRoutes from "./roles/Manager/routes/ManagerRoutes";

// Manager extra pages
import FiscalCloseMain from "./roles/Manager/pages/FiscalClose/FiscalCloseMain";

const App = () => {
  const roleId = parseInt(localStorage.getItem("role_id") || "0");

  // Map role_id → root path
  const rolePathMap: Record<number, string> = {
    1: "accountant",
    2: "manager",
    3: "auditor",
    4: "compliance",
  };

  const path = rolePathMap[roleId] || "";

  return (
    <Router>
      <Routes>

        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />

        {/* ROOT REDIRECT */}
        <Route
          path="/"
          element={path ? <Navigate to={`/${path}`} /> : <Navigate to="/login" />}
        />

        {/* ACCOUNTANT ROUTES */}
        <Route path="/accountant/*" element={<AccountantLayout />}>
          <Route path="*" element={<AccountantRoutes />} />
        </Route>

        {/* MANAGER ROUTES */}
        <Route path="/manager/*" element={<ManagerLayout />}>

          {/* Manager main routes */}
          <Route path="*" element={<ManagerRoutes />} />

          {/* Specific fiscal close page */}
          <Route path="fiscal-close" element={<FiscalCloseMain />} />

        </Route>

        {/* AUDITOR ROUTES */}
        <Route path="/auditor/*" element={<AuditorLayout />}>
          <Route path="*" element={<AuditorRoutes />} />
        </Route>

        {/* COMPLIANCE ROUTES */}
        <Route path="/compliance/*" element={<ComplianceLayout />}>
          <Route path="*" element={<ComplianceRoutes />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;
