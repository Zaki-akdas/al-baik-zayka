import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { getRoleStatus } from "@/lib/db";
import { Loader2 } from "lucide-react";

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [roleStatus, setRoleStatus] = useState<{ role: string | null } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getRoleStatus().then(setRoleStatus).catch(console.error);
    }
  }, [isAuthenticated]);

  if (isLoading || (isAuthenticated && roleStatus === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-maroon" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const hasRole = roleStatus?.role && roles.includes(roleStatus.role);
  if (!hasRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
