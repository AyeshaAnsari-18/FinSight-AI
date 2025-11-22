import { Outlet } from "react-router-dom";
import ComplianceSidebar from "./ComplianceSidebar";
import ComplianceNavbar from "./ComplianceNavbar";

const ComplianceLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ComplianceSidebar />

      <div className="flex flex-col flex-1">
        <ComplianceNavbar />

        <main className="p-4">
          <Outlet />   {/* Router puts pages here */}
        </main>
      </div>
    </div>
  );
};

export default ComplianceLayout;
