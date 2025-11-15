import AccountantSidebar from "./AccountantSidebar";
import AccountantNavbar from "./AccountantNavbar";
import AccountantRoutes from "../routes/AccountantRoutes";

const AccountantLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AccountantSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1">
        <AccountantNavbar />

        <main className="p-4">
          <AccountantRoutes />
        </main>
      </div>
    </div>
  );
};

export default AccountantLayout;
