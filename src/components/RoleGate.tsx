import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { can, ROLE_LABEL, type Permission } from "@/lib/roles";

export function RoleGate({
  permission,
  children,
  title = "Restricted section",
}: {
  permission: Permission;
  children: ReactNode;
  title?: string;
}) {
  const { user } = useAuth();
  if (can(user?.role, permission)) return <>{children}</>;

  const label = ROLE_LABEL[(user?.role ?? "").toLowerCase()] ?? user?.role ?? "your role";
  return (
    <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
      <div className="eyebrow text-coral mb-4">Access restricted</div>
      <h1 className="display-md">{title}</h1>
      <p className="mt-6 text-foreground/75">
        This section is not available for <span className="font-semibold">{label}</span> accounts.
        Contact an administrator if you need elevated access.
      </p>
      <div className="mt-8">
        <Link to="/dashboard" className="pill pill-coral">Back to dashboard</Link>
      </div>
    </div>
  );
}
