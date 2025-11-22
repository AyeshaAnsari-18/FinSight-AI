import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
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

// Sidebar menu for Compliance
export const complianceMenu: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/compliance" },
  { label: "Dept Clearance Panel", icon: CheckCircle, path: "/compliance/dept-clearance" },
  {
    label: "Compliance Monitoring",
    icon: AlertTriangle,
    path: "",
    children: [
      { label: "Monitoring Overview", path: "/compliance/monitoring-overview" },
      { label: "Red Flags", path: "/compliance/red-flags" },
    ],
  },
  {
    label: "Controls",
    icon: Repeat,
    path: "",
    children: [
      { label: "Control Evidence", path: "/compliance/control-evidence" },
      { label: "Control Testing", path: "/compliance/control-testing" },
      { label: "Internal Controls", path: "/compliance/internal-controls" },
    ],
  },
  { label: "Policies", icon: Book, path: "", children: [
      { label: "All Policies", path: "/compliance/policies" },
      { label: "Policy Details", path: "/compliance/policy-details" },
      { label: "Policy Violations", path: "/compliance/policy-violations" },
  ]},
  { label: "Regulatory", icon: FileText, path: "", children: [
      { label: "Compliance Reports", path: "/compliance/reports" },
      { label: "Regulatory Requirements", path: "/compliance/regulatory-requirements" },
  ]},
  { label: "AI Copilot", icon: Bot, path: "/compliance/copilot" },
];

const ComplianceSidebar = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`${isExpanded ? "w-64" : "w-20"} bg-[#0A2342] text-white min-h-screen p-4 flex flex-col transition-all duration-300`}>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-6 text-white hover:text-[#F5C542] transition"
      >
        {isExpanded ? <ChevronsLeft size={24} /> : <ChevronsRight size={24} />}
      </button>

      {isExpanded && <h1 className="text-xl font-bold mb-6">Compliance</h1>}

      <nav className="flex flex-col gap-2">
        {complianceMenu.map((item) => {
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
                          `py-1 px-2 rounded transition ${isActive ? "bg-[#F5C542] text-[#0A2342] font-semibold" : "text-white hover:bg-[#1D4ED8]"}` 
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
                `flex items-center gap-3 py-2 px-2 rounded transition font-medium ${isActive ? "bg-[#F5C542] text-[#0A2342] font-semibold" : "text-white hover:bg-[#1D4ED8]"}`
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

export default ComplianceSidebar;
