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

const AuditorNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search) return;
    // Navigate to auditor search page with query
    navigate(`/auditor/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="w-full h-16 bg-[#0A2342] px-4 flex items-center justify-between shadow-md border-b border-[#1D4ED8]">

      {/* Left: Search Bar */}
      <div className="flex items-center gap-2 w-1/3">
        <div className="relative w-full">
          <Input
            placeholder="Search dashboard, tasks, journals, alerts..."
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

        {/* Alerts -> Flags and Red Alerts page */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#1D4ED8]"
            onClick={() => navigate("/auditor/flags")}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#F5C542] text-[#0A2342] hover:bg-[#e4b134]">
              <Plus size={16} /> Quick Actions
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-white shadow-md border border-gray-200">
            {/* Only auditor pages from sidebar */}
            <DropdownMenuItem
              onClick={() => navigate("/auditor/tasks/view")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Task Audit
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/auditor/journals/details")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Journal Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/auditor/journals/exceptions")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Journal Exceptions
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/auditor/journals/review")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Journal Reviews
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/auditor/reconciliations/issues")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Reconciliation Issues
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/auditor/reconciliations/review")}
              className="flex items-center gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Reconciliation Reviews
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border-2 border-[#F5C542]">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-[#F5C542] text-[#0A2342] font-bold">AA</AvatarFallback>
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
                // clear auth
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

export default AuditorNavbar;
