import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getHealth } from "@/lib/api";

const leftLinks = [
  { to: "/predict", label: "Predict" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
] as const;

const rightLinks = [
  { to: "/performance", label: "Performance" },
  { to: "/about", label: "About" },
] as const;

const allLinks = [{ to: "/", label: "Home" }, ...leftLinks, ...rightLinks] as const;

function Wordmark() {
  return (
    <Link to="/" className="font-display text-2xl md:text-[28px] tracking-tight text-foreground hover:opacity-90 transition-opacity">
      GENESCOPE
    </Link>
  );
}

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "bg-cream text-green-deep" }}
      inactiveProps={{ className: "text-cream/85 hover:bg-cream hover:text-green-deep" }}
      className="rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors"
    >
      {label}
    </Link>
  );
}

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
    <header className="sticky top-0 z-40 bg-green-deep text-cream">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20 gap-6">
          {/* Left */}
          <nav className="hidden md:flex items-center gap-7 justify-start">
            {leftLinks.map((l) => <NavLink key={l.to} {...l} />)}
          </nav>

          {/* Center wordmark */}
          <div className="flex justify-center">
            <Wordmark />
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-7 justify-end">
            {rightLinks.map((l) => <NavLink key={l.to} {...l} />)}
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                online ? "bg-cream text-green-deep" : "bg-coral text-green-deep"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-green-deep" : "bg-green-deep"} ${online ? "animate-pulse" : ""}`} />
              {online ? "Online" : "Offline"}
            </span>
          </div>

          {/* Mobile hamburger placed across grid */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-muted text-foreground col-start-3 justify-self-end"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-5 space-y-1 border-t border-foreground/15 pt-3">
            {allLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-foreground bg-foreground/10" }}
                inactiveProps={{ className: "text-foreground/75" }}
                className="block rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wider"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-4 pt-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                  online ? "bg-cream text-green-deep" : "bg-coral text-green-deep"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full bg-green-deep`} />
                {online ? "Model Online" : "Server Offline"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
