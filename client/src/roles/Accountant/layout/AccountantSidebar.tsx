import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Upload, CheckCircle, Repeat, Book, AlertTriangle, FileText, Bot } from "lucide-react";

export const accountantMenu = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/accountant" },
  { label: "Upload Documents", icon: Upload, path: "/accountant/upload" },
  {
    label: "Tasks",
    icon: CheckCircle,
    children: [
      { label: "Accrual Adjustments", path: "/accountant/tasks/accruals" },
      { label: "Tax Adjustments", path: "/accountant/tasks/tax" },
    ],
  },
  {
    label: "Reconciliation",
    icon: Repeat,
    children: [
      { label: "Bank Reconciliation", path: "/accountant/reconcile/bank" },
      { label: "Vendor Reconciliation", path: "/accountant/reconcile/vendor" },
    ],
  },
  { label: "Journal Entries", icon: Book, path: "/accountant/journals" },
  { label: "Alerts", icon: AlertTriangle, path: "/accountant/alerts" },
  { label: "My Reports", icon: FileText, path: "/accountant/reports" },
  { label: "AI Copilot", icon: Bot, path: "/accountant/copilot" },
];

const AccountantSidebar = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Accountant</h1>

      <nav className="flex flex-col gap-2">
        {accountantMenu.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="flex items-center gap-2 w-full py-2 px-2 rounded hover:bg-gray-100 text-left font-medium"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
                {openMenus[item.label] && (
                  <div className="ml-6 flex flex-col gap-1 mt-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={child.path}
                        className={({ isActive }: { isActive: boolean }) =>
                          `py-1 px-2 rounded hover:bg-gray-200 ${isActive ? "bg-gray-200 font-bold" : ""}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-100 font-medium ${isActive ? "bg-gray-100 font-bold" : ""}`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AccountantSidebar;
