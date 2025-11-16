import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccountantLayout from "./roles/Accountant/layout/AccountantLayout";
import AccountantRoutes from "./roles/Accountant/routes/AccountantRoutes";

type UserRole = "accountant" | "auditor" | "manager" | "compliance";

function App() {
  const role: UserRole = "accountant"; 
  // Later replace with: localStorage.getItem("role") as UserRole

  return (
    <BrowserRouter>
      <Routes>

        {/* Role-based layout */}
        <Route
          path="/*"
          element={
            role === "accountant" ? <AccountantLayout /> :
            // role === "auditor" ? <AuditorLayout /> :
            // role === "manager" ? <ManagerLayout /> :
            // role === "compliance" ? <ComplianceLayout /> :
            <div>Invalid role</div>
          }
        >
          {/* Nested role routes */}
          {role === "accountant" && (
            <Route path="accountant/*" element={<AccountantRoutes />} />
          )}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
