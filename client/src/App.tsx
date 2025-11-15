import { BrowserRouter, Routes, Route } from "react-router-dom";
import AccountantLayout from "./roles/Accountant/layout/AccountantLayout";
// import AuditorLayout from "./roles/auditor/AuditorLayout";
// import ManagerLayout from "./roles/manager/ManagerLayout";
// import ComplianceLayout from "./roles/compliance/ComplianceLayout";
{/* import Login from "./pages/Login"; */}

function App() {
  // For now, we can hardcode role = 'accountant' to test
  const role = "accountant"; 
  // Later, use: localStorage.getItem("role") or AuthContext

  return (
    <BrowserRouter>
      <Routes>
        {/*} <Route path="/login" element={<Login />} /> */}

        {/* Role-based entry point */}
        <Route
          path="/*"
          element={
            role === "accountant" ? <AccountantLayout /> :
            // role === "auditor" ? <AuditorLayout /> :
            // role === "manager" ? <ManagerLayout /> :
            // role === "compliance" ? <ComplianceLayout /> :
            <AccountantLayout />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
