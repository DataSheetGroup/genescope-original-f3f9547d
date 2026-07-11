import { useEffect, type ReactNode } from "react";

// Theme is fixed to dark. The provider only ensures the data-theme attribute
// is applied on hydration; the light/dark toggle has been removed.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    try {
      localStorage.removeItem("genescope-theme");
    } catch {
      /* noop */
    }
  }, []);
  return <>{children}</>;
}
