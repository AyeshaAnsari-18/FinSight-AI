import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";


import { setCredentials, decodeToken, setLoading } from "./store/authSlice";
import { type RootState } from "./store/store";
import api from "./lib/api";


import Login from "./Pages/login/Page";


import AccountantLayout from "./roles/Accountant/layout/AccountantLayout";
import AuditorLayout from "./roles/Auditor/layout/AuditorLayout";
import ComplianceLayout from "./roles/Compliance/layout/ComplianceLayout";
import ManagerLayout from "./roles/Manager/layout/ManagerLayout";


import AccountantRoutes from "./roles/Accountant/routes/AccountantRoutes";
import AuditorRoutes from "./roles/Auditor/routes/AuditorRoutes";
import ComplianceRoutes from "./roles/Compliance/routes/ComplianceRoutes";
import ManagerRoutes from "./roles/Manager/routes/ManagerRoutes";


import FiscalCloseMain from "./roles/Manager/pages/FiscalClose/FiscalCloseMain";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = Cookies.get("refreshToken");
      
      
      if (refreshToken && !isAuthenticated) {
        try {
          const { data } = await api.post("/auth/refresh", {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          const decodedUser = decodeToken(data.access_token);
          if (decodedUser) {
            dispatch(setCredentials({
              user: decodedUser,
              accessToken: data.access_token,
              refreshToken: data.refresh_token
            }));
          }
        } catch (error) {
          console.log("Session expired or invalid: ", error);
          Cookies.remove("refreshToken");
        }
      }
      dispatch(setLoading(false));
    };

    restoreSession();
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#3b165f]">Loading FinSight AI...</div>;
  }

  return (
    <Router>
      <Routes>
        
        {/* LOGIN PAGE - Redirect to role dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? <Login /> : (
               
               user?.role === 'ACCOUNTANT' ? <Navigate to="/accountant" /> :
               user?.role === 'MANAGER' ? <Navigate to="/manager" /> :
               user?.role === 'AUDITOR' ? <Navigate to="/auditor" /> :
               user?.role === 'COMPLIANCE' ? <Navigate to="/compliance" /> :
               <Navigate to="/login" />
            )
          } 
        />

        {/* ROOT REDIRECT */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        {/* 🛡️ PROTECTED ROUTES (Only accessible if isAuthenticated) */}
        
        {/* ACCOUNTANT */}
        <Route path="/accountant/*" element={isAuthenticated && user?.role === 'ACCOUNTANT' ? <AccountantLayout /> : <Navigate to="/login" />}>
          <Route path="*" element={<AccountantRoutes />} />
        </Route>

        {/* MANAGER */}
        <Route path="/manager/*" element={isAuthenticated && user?.role === 'MANAGER' ? <ManagerLayout /> : <Navigate to="/login" />}>
          <Route path="*" element={<ManagerRoutes />} />
          <Route path="fiscal-close" element={<FiscalCloseMain />} />
        </Route>

        {/* AUDITOR */}
        <Route path="/auditor/*" element={isAuthenticated && user?.role === 'AUDITOR' ? <AuditorLayout /> : <Navigate to="/login" />}>
          <Route path="*" element={<AuditorRoutes />} />
        </Route>

        {/* COMPLIANCE */}
        <Route path="/compliance/*" element={isAuthenticated && user?.role === 'COMPLIANCE' ? <ComplianceLayout /> : <Navigate to="/login" />}>
          <Route path="*" element={<ComplianceRoutes />} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;