import { useState } from "react";
import type { ChangeEvent } from "react";
import { Search, Bell, Plus } from "lucide-react";
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

const ComplianceNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search) return;
    navigate(`/compliance/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="w-full h-16 bg-[#0A2342] px-4 flex items-center justify-between shadow-md border-b border-[#1D4ED8]">

      {/* Left: Search Bar */}
      <div className="flex items-center gap-2 w-1/3">
        <div className="relative w-full">
          <Input
            placeholder="Search dashboard, controls, policies, reports..."
            className="pl-10 bg-white/90 focus:bg-white text-[#0A2342] placeholder-gray-500 border border-gray-300 shadow-sm"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
        </div>
      </div>

      {/* Right: Icons & Menus */}
      <div className="flex items-center gap-4">

        {/* Alerts -> Red Flags */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#1D4ED8]"
            onClick={() => navigate("/compliance/red-flags")}
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
            {/* Quick links to pages in the sidebar */}
            <DropdownMenuItem
              onClick={() => navigate("/compliance/dept-clearance")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Dept Clearance Panel
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/compliance/monitoring-overview")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Monitoring Overview
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/compliance/control-evidence")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Control Evidence
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/compliance/internal-controls")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Internal Controls
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border-2 border-[#F5C542]">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-[#F5C542] text-[#0A2342] font-bold">CC</AvatarFallback>
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
              onClick={() => {
                
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", { replace: true, state: { message: "Successfully logged out" }});
              }}
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

export default ComplianceNavbar;
