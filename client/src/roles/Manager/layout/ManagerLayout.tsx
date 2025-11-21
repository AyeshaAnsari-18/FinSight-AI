import { Outlet } from "react-router-dom";
import AccountantSidebar from "./AccountantSidebar";
import AccountantNavbar from "./AccountantNavbar";

const AccountantLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AccountantSidebar />

      <div className="flex flex-col flex-1">
        <AccountantNavbar />

        <main className="p-4">
          <Outlet />   {/* Router puts pages here */}
        </main>
      </div>
    </div>
  );
};

export default AccountantLayout;
