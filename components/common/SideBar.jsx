"use client";
import React, { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "../../constants";
import { useNotifications } from "../../context/NotificationsContext";

/**
 * Check if currentPath matches any path pattern in matchPaths.
 * - Treats "[id]" as a single path segment wildcard.
 * - Ignores trailing slashes.
 */
// matcher utils (place near the top of the file)
function normalizePath(p) {
  if (!p) return "";
  return p.replace(/\/+$/, ""); // strip trailing slashes
}

function patternToRegex(pattern) {
  // Replace [id] with a temporary token to avoid escaping it
  const TOKEN = "__ID_TOKEN__";
  const withToken = pattern.replace(/\[id\]/g, TOKEN);

  // Escape arbitrary regex special chars
  const escaped = withToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Replace our token with the wildcard segment
  const regexStr = "^" + escaped.replace(new RegExp(TOKEN, "g"), "([^/]+)") + "\\/?$";
  return new RegExp(regexStr);
}

function isActivePath(matchPaths, currentPath) {
  if (!Array.isArray(matchPaths) || matchPaths.length === 0) return false;
  const cp = normalizePath(currentPath || "");
  return matchPaths.some((mp) => {
    const mpNorm = normalizePath(mp || "");
    if (mpNorm === cp) return true;
    if (mp.includes("[id]")) {
      const re = patternToRegex(mp);
      return re.test(cp) || re.test(currentPath || "");
    }
    return false;
  });
}

export default function SideBar({ sidebarOpen }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-32 sm:w-64" : "w-0 lg:w-16"
      } overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-center">
          {sidebarOpen ? (
            <div className="text-[#5A443A] font-bold text-xl">المدير</div>
          ) : (
            <div className="hidden lg:flex justify-center items-center h-10 w-10 rounded-md bg-[#5A443A] text-white">
              م
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {MENU_ITEMS?.map((item, index) => {
            const IconComponent = item.icon;
  const isActive = isActivePath(item.matchPaths || [item.href], pathname);
            return (
              <Link
                key={index}
                href={item.href}
                className={`relative flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-[#FFF8F0] text-[#5A443A]"
                    : "text-[#402E32] hover:bg-[#FFF8F0]"
                }`}
              >
                <div className="text-[#5A443A]">
                  <IconComponent size={20} className="ml-4" />
                </div>

                {sidebarOpen && <span>{item.name}</span>}

                {/* ✅ Badge only for notifications */}
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute right-1 top-1 bg-red-500 text-white text-xs px-1.5 py-[1px] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center px-3 py-3 text-sm font-medium rounded-md text-[#F7931D] hover:bg-[#FFF8F0] transition-colors duration-200"
            >
              <LogOutIcon size={20} className="ml-3" />
              {sidebarOpen && <span>تسجيل الخروج</span>}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
