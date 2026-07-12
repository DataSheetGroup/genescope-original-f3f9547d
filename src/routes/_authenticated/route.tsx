import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { clearToken, isAuthenticated, me as apiMe } from "@/lib/auth";

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

    let blockedByStatus = false;
    const sessionToken = window.sessionStorage.getItem("genescope.session_token");
    const localToken = window.localStorage.getItem("genescope.access_token");
    const token = sessionToken || localToken;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        blockedByStatus = payload?.status !== "active";
      } catch (error) {
        blockedByStatus = false;
      }
    }

    try {
      const user = await apiMe();
      blockedByStatus = blockedByStatus || user?.status !== "active";
    } catch {
      clearToken();
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    if (blockedByStatus) {
      clearToken();
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
