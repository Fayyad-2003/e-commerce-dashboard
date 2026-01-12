"use client"; // Retain the client directive
import { useState } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { NavBar, SideBar } from "../common";
import { NotificationsProvider } from "../../context";

// Remove the Cairo import, as the font class is applied in the Server Component

// 👇 Change the name and remove the extra props like cairo
export default function ClientLayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 👇 المسارات التي لا نريد فيها الهيدر/السايدبار
  const segments = useSelectedLayoutSegments();
  const authRoutes = new Set(["login"]);
  const hideChrome = segments.some((seg) => authRoutes.has(seg));

  return (
    // 👇 Start rendering directly from the content within <body>
    <>
      {hideChrome ? (
        // ✅ وضع بسيط بدون هيدر/سايدبار لصفحات auth
        <main className="flex-1 overflow-y-auto p-0">{children}</main>
      ) : (
        // ✅ الوضع العادي لباقي الصفحات
        <>
          <NavBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <NotificationsProvider>
            <div className="flex flex-1 overflow-hidden">
              <SideBar sidebarOpen={sidebarOpen} />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300">
                {children}
              </main>
            </div>
          </NotificationsProvider>
        </>
      )}
    </>
  );
}