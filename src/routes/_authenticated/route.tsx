import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { clearToken, isAuthenticated, isPendingRole, me as apiMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      const isRoot = location.pathname === "/" && !location.searchStr;
      throw redirect({
        to: "/login",
        search: isRoot ? {} : { redirect: location.href },
      });
    }

    let blocked = false;
    const sessionToken = window.sessionStorage.getItem("genescope.session_token");
    const localToken = window.localStorage.getItem("genescope.access_token");
    const token = sessionToken || localToken;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        blocked = isPendingRole(payload?.role);
      } catch {
        blocked = false;
      }
    }

    try {
      const user = await apiMe();
      blocked = blocked || isPendingRole(user?.role);
    } catch {
      clearToken();
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    if (blocked) {
      clearToken();
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
