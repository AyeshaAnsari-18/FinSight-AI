import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import ManagerNavbar from "./ManagerNavbar";

const ManagerLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />

      <div className="flex flex-col flex-1">
        <ManagerNavbar />

        <main className="p-4">
          <Outlet />   {/* Router puts pages here */}
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
