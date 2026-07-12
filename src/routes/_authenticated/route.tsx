import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "@/lib/auth";

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
  },
  component: () => <Outlet />,
});
