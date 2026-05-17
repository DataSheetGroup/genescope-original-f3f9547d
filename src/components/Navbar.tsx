import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getHealth } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <Link to="/" className="font-brand text-2xl md:text-[28px] tracking-tight hover:opacity-90 transition-opacity" style={{ color: "var(--nav-fg)" }}>
      GeneScope
    </Link>
  );
}

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ style: { background: "var(--surface-strong)", color: "var(--nav-bg)" } }}
      inactiveProps={{ className: "opacity-85 hover:opacity-100" }}
      className="rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors"
      style={{ color: "var(--nav-fg)" }}
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
    <header className="sticky top-0 z-40" style={{ background: "var(--nav-bg)", color: "var(--nav-fg)" }}>
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
          <div className="hidden md:flex items-center gap-5 justify-end">
            {rightLinks.map((l) => <NavLink key={l.to} {...l} />)}
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                background: online ? "var(--surface-strong)" : "var(--coral)",
                color: "var(--nav-bg)",
              }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${online ? "animate-pulse" : ""}`} style={{ background: "var(--nav-bg)" }} />
              {online ? "Online" : "Offline"}
            </span>
            <ThemeToggle />
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
            <div className="px-4 pt-3 flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ background: online ? "var(--surface-strong)" : "var(--coral)", color: "var(--nav-bg)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--nav-bg)" }} />
                {online ? "Model Online" : "Server Offline"}
              </span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
