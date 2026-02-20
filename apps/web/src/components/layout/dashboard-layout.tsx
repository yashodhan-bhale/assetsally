"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuth } from "../../contexts/auth-context";
import { navItems } from "../../lib/nav-config";
import { cn } from "../../lib/utils"; // Assuming utils exists, if not I'll create it or inline

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!user?.appType) return false;
    // Map appType to Role for simplicity or check both
    const userRole = user.appType === "ADMIN" ? "ADMIN" : "CLIENT";
    return item.roles?.includes(userRole);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 overflow-x-hidden",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {isSidebarOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              AssetsAlly
            </span>
          ) : (
            <span className="text-xl font-bold text-blue-400 mx-auto">AA</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200 group relative py-2.5",
                  isSidebarOpen ? "gap-3 px-3" : "justify-center px-0",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-blue-400",
                  )}
                />
                {isSidebarOpen && (
                  <span className="font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">
                    {item.title}
                  </span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 w-full py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors",
              isSidebarOpen ? "px-3" : "justify-center px-0",
            )}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0",
          isSidebarOpen ? "md:ml-64" : "md:ml-20",
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="font-medium text-slate-900">Dashboard</span>
            {pathname !== "/dashboard" && (
              <>
                <ChevronRight size={14} />
                <span className="capitalize text-slate-900">
                  {pathname.split("/").pop()?.replace("-", " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user?.appType?.toLowerCase() || "Guest"}
              </p>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
