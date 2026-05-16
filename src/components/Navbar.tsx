import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock, Menu, X } from "lucide-react";
import { useState } from "react";
import { getHealth } from "@/lib/api";
import logo from "@/assets/genescope-logo.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Predict" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/performance", label: "Performance" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 15_000,
    retry: 1,
  });
  const online = !!data && !isError;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="GeneScope" className="h-9 w-9" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                GeneScope
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Lock className="h-2.5 w-2.5" /> Local
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary bg-primary/10" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                online
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  online ? "bg-success animate-pulse" : "bg-destructive"
                }`}
              />
              {online ? "Model Online" : "Server Offline"}
            </span>
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary bg-primary/10" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="block rounded-md px-3 py-2 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-3 pt-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                  online
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    online ? "bg-success" : "bg-destructive"
                  }`}
                />
                {online ? "Model Online" : "Server Offline"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
