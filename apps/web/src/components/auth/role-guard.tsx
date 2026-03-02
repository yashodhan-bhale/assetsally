"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useAuth } from "../../contexts/auth-context";
import { hasRole, Role } from "../../lib/rbac";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode; // Optional: what to render if access denied (default: null/redirect)
  redirectTo?: string; // Optional: where to redirect (default: /dashboard)
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.role?.toUpperCase();
      const appType = user.appType?.toUpperCase();
      const roles = allowedRoles.map(r => r.toUpperCase());

      const isAllowed = roles.includes(userRole) || roles.includes(appType);

      if (!isAllowed) {
        if (redirectTo) {
          if (window.location.pathname !== redirectTo) {
            router.push(redirectTo);
          }
        }
      }
    } else if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userRole = user.role?.toUpperCase();
  const appType = user.appType?.toUpperCase();
  const roles = allowedRoles.map(r => r.toUpperCase());

  const isAllowed = roles.includes(userRole) || roles.includes(appType);

  if (!isAllowed) {
    return fallback || (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-4">You do not have permission to view this page.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
