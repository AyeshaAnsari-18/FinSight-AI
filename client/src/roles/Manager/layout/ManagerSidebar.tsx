import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  CheckCircle,
  Repeat,
  Book,
  AlertTriangle,
  FileText,
  Bot,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";


interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: { label: string; path: string }[];
}


export const managerMenu: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/manager" },
  { label: "Audit Trail", icon: Upload, path: "/manager/auditTrail" },
  { label: "Compliance Overview", icon: AlertTriangle, path: "/manager/complianceOverview" },
  {
    label: "Departments",
    icon: CheckCircle,
    path: "",
    children: [
      { label: "Departments Overview", path: "/manager/departmentsOverview" },
    ],
  },
  {
    label: "Fiscal Close",
    icon: Repeat,
    path: "/manager/fiscalCloseAgent",
  },
  {
    label: "Forecasting",
    icon: FileText,
    path: "",
    children: [
      { label: "Forecast Scenarios", path: "/manager/forecastScenarios" },
      { label: "What-If Analysis", path: "/manager/whatIfAnalysis" },
    ],
  },
  { label: "Narratives", icon: Book, path: "/manager/narrativeReports" },
  { label: "Tasks", icon: CheckCircle, path: "/manager/managerTasks" },
  { label: "AI Copilot", icon: Bot, path: "/manager/managerCopilot" },
];

const ManagerSidebar = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={`${
        isExpanded ? "w-64" : "w-20"
      } bg-[#0A2342] text-white min-h-screen p-4 flex flex-col transition-all duration-300`}
    >
      {/* Toggle Expand/Collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-6 text-white hover:text-[#F5C542] transition"
      >
        {isExpanded ? <ChevronsLeft size={24} /> : <ChevronsRight size={24} />}
      </button>

      {/* Sidebar Title */}
      {isExpanded && <h1 className="text-xl font-bold mb-6">Manager</h1>}

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {managerMenu.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="flex items-center gap-3 w-full py-2 px-2 rounded hover:bg-[#1D4ED8] transition text-left font-medium"
                >
                  <item.icon className="w-5 h-5 text-white" />
                  {isExpanded && item.label}
                </button>

                {openMenus[item.label] && isExpanded && (
                  <div className="ml-7 flex flex-col gap-1 mt-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={child.path}
                        className={({ isActive }) =>
                          `py-1 px-2 rounded transition ${
                            isActive
                              ? "bg-[#F5C542] text-[#0A2342] font-semibold"
                              : "text-white hover:bg-[#1D4ED8]"
                          }`
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
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-2 rounded transition font-medium ${
                  isActive
                    ? "bg-[#F5C542] text-[#0A2342] font-semibold"
                    : "text-white hover:bg-[#1D4ED8]"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {isExpanded && item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default ManagerSidebar;
