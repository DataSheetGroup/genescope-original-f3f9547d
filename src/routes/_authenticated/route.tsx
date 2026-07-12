import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { clearToken, isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      const isRoot = location.pathname === "/" && !location.searchStr;
      throw redirect({
        to: "/login",
        search: isRoot ? {} : { redirect: location.href },
      });
    }

    const sessionToken = window.sessionStorage.getItem("genescope.session_token");
    const localToken = window.localStorage.getItem("genescope.access_token");
    const token = sessionToken || localToken;
    if (token) {
      let blockedByStatus = false;
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        blockedByStatus = Boolean(payload?.status && payload.status !== "active");
      } catch (error) {
        blockedByStatus = false;
      }
      if (blockedByStatus) {
        clearToken();
        throw redirect({ to: "/login", search: { redirect: location.href } });
      }
    }
  },
  component: () => <Outlet />,
});
