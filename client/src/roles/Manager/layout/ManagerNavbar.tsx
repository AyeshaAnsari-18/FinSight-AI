import { useState, type ChangeEvent } from "react";
import { Search, Bell, Plus, FileText} from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ManagerNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search) return;
    navigate(`/manager/search?q=${search}`);
  };

  return (
    <div className="w-full h-16 bg-[#0A2342] px-4 flex items-center justify-between shadow-md border-b border-[#1D4ED8]">

      {/* Left: Search Bar */}
      <div className="flex items-center gap-2 w-1/3">
        <div className="relative w-full">
          <Input
            placeholder="Search reports, tasks, departments..."
            className="pl-10 bg-white/90 focus:bg-white text-[#0A2342] placeholder-gray-500 border border-gray-300 shadow-sm"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4">

        {/* Alerts / Notifications */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#1D4ED8]"
            onClick={() => navigate("/manager/complianceOverview")}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#F5C542] text-[#0A2342] hover:bg-[#e4b134]">
              <Plus size={16} /> Quick Actions
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-white shadow-md border border-gray-200">
            <DropdownMenuItem
              onClick={() => navigate("/manager/narrativeReports")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <FileText size={16} /> View Narrative Reports
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/manager/forecastScenarios")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <FileText size={16} /> Forecast Scenarios
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/manager/whatIfAnalysis")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <FileText size={16} /> What-If Analysis
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border-2 border-[#F5C542]">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-[#F5C542] text-[#0A2342] font-bold">
                MG
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40 bg-white shadow-md border border-gray-200">
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="hover:bg-[#1D4ED8] hover:text-white transition"
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="hover:bg-[#1D4ED8] hover:text-white transition"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/logout")}
              className="hover:bg-red-500 hover:text-white transition"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
};

export default ManagerNavbar;
