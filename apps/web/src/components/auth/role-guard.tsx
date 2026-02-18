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
      if (!hasRole(user.role, allowedRoles)) {
        if (redirectTo) {
          // Prevent infinite redirect loop if already on fallback/dashboard
          if (window.location.pathname !== redirectTo) {
            router.push(redirectTo);
          }
        }
      }
    } else if (!isLoading && !isAuthenticated) {
      // Handled by AuthGuard or similar usually, but good fallback
      router.push("/login");
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  if (!hasRole(user.role, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
