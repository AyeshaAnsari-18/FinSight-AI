import { useState } from "react";
import type { ChangeEvent } from "react";
import { Search, Bell, Plus, Upload, BookPlus } from "lucide-react";
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

const AccountantNavbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search) return;
    navigate(`/accountant/search?q=${search}`);
  };

  return (
    <div className="w-full h-16 bg-[#0A2342] px-4 flex items-center justify-between shadow-md border-b border-[#1D4ED8]">
      
      {/* Left: Search Bar */}
      <div className="flex items-center gap-2 w-1/3">
        <div className="relative w-full">
          <Input
            placeholder="Search tasks, documents, journals..."
            className="pl-10 bg-white/90 focus:bg-white cursor-pointer text-[#0A2342] placeholder-gray-500 border border-gray-300 shadow-sm"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4">

        {/* Alerts */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            className="text-white cursor-pointer hover:bg-[#1D4ED8]"
            onClick={() => navigate("/accountant/alerts")}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center cursor-pointer gap-2 bg-[#F5C542] text-[#0A2342] hover:bg-[#e4b134]">
              <Plus size={16} /> Quick Actions
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 bg-white shadow-md border border-gray-200"
          >
            <DropdownMenuItem
              onClick={() => navigate("/accountant/upload")}
              className="flex items-center cursor-pointer gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Upload size={16} /> Upload Document
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/accountant/journals/create")}
              className="flex items-center cursor-pointer gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <BookPlus size={16} /> New Journal Entry
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate("/accountant/tasks/accruals")}
              className="flex items-center cursor-pointer gap-2 hover:bg-[#1D4ED8] hover:text-white transition"
            >
              <Plus size={16} /> Add Accrual Adjustment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer border-2 border-[#F5C542]">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-[#F5C542] text-[#0A2342] font-bold">
                AA
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-40 bg-white shadow-md border border-gray-200"
          >
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="hover:bg-[#1D4ED8] hover:text-white transition cursor-pointer"
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="hover:bg-[#1D4ED8] hover:text-white transition cursor-pointer"
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
              className="hover:bg-red-500 hover:text-white transition cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
};

export default AccountantNavbar;
