"use client";
import { MenuIcon, UserIcon } from "lucide-react";

export default function NavBar({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-[#402E32] hover:bg-[#FFF8F0] transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <MenuIcon size={24} />
          </button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-bold text-[#5A443A]">لوحة التحكم</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block mr-3 text-sm font-medium ml-3">
            Admin
          </div>
          <div className="h-8 w-8 rounded-full bg-[#5A443A] text-white flex items-center justify-center">
            <UserIcon size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
