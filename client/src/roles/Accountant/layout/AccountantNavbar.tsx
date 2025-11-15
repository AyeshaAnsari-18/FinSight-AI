import { useState } from "react";
import type { ChangeEvent } from "react";
import { Search, Bell, Plus, Upload, BookPlus } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../../../components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AccountantNavbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search) return;
    navigate(`/accountant/search?q=${search}`);
  };

  return (
    <div className="w-full h-16 bg-white border-b px-4 flex items-center justify-between shadow-sm">
      
      {/* Left: Search Bar */}
      <div className="flex items-center gap-2 w-1/3">
        <div className="relative w-full">
          <Input
            placeholder="Search tasks, documents, journals..."
            className="pl-10"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSearch()}
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
        </div>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-4">

        {/* Alerts */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/accountant/alerts")}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Quick Actions
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => navigate("/accountant/upload")}
              className="flex items-center gap-2"
            >
              <Upload size={16} /> Upload Document
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/accountant/journals/create")}
              className="flex items-center gap-2"
            >
              <BookPlus size={16} /> New Journal Entry
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate("/accountant/tasks/accruals")}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Accrual Adjustment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>AA</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/logout")}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
