"use client";

import {
  LayoutDashboard,
  MapPin,
  Package,
  FileCheck,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Menu,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "../../contexts/auth-context";
import { UserRole, hasRole } from "../../lib/rbac";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.CLIENT],
  },
  {
    href: "/dashboard/locations",
    label: "Locations",
    icon: MapPin,
    roles: [UserRole.ADMIN, UserRole.CLIENT],
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    roles: [UserRole.ADMIN, UserRole.CLIENT],
  },
  {
    href: "/dashboard/audits",
    label: "Audit Reports",
    icon: FileCheck,
    roles: [UserRole.ADMIN, UserRole.CLIENT],
  },
  {
    href: "/dashboard/qr-tags",
    label: "QR Tags",
    icon: QrCode,
    roles: [UserRole.ADMIN],
  },
  {
    href: "/dashboard/imports",
    label: "Data Import",
    icon: Upload,
    roles: [UserRole.ADMIN],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
                fixed lg:sticky top-0 h-screen z-50
                bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50
                flex flex-col transition-all duration-300 ease-in-out
                ${collapsed ? "w-[72px]" : "w-64"}
                ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 h-16 border-b border-slate-800/50 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">
              Assets<span className="text-blue-400">Ally</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (user && !hasRole(user.role, item.roles)) return null;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                    ${
                                      isActive
                                        ? "bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    }
                                    ${collapsed ? "justify-center" : ""}
                                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Collapse */}
        <div className="p-3 border-t border-slate-800/50 space-y-2">
          {!collapsed && user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
            title="Sign out"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-3 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">
              {navItems.find(
                (n) =>
                  pathname === n.href ||
                  (n.href !== "/dashboard" && pathname.startsWith(n.href)),
              )?.label || "Dashboard"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-300">{user?.role}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
