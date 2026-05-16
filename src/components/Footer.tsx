import { Link } from "@tanstack/react-router";

const footerLinks = [
  { to: "/about", label: "About" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/predict", label: "Predict" },
  { to: "/performance", label: "Performance" },
  { to: "/history", label: "History" },
] as const;

export function Footer() {
  return (
    <footer className="slab-cream pt-24 pb-10 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* Link row */}
        <nav className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {footerLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-display text-base md:text-lg hover:opacity-70 transition-opacity"
              style={{ color: "var(--green-deep)" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Legal row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-semibold" style={{ color: "var(--green-deep)" }}>
          <span>© {new Date().getFullYear()} GeneScope · FEU Institute of Technology</span>
          <span>Data partner: Molave Trading Inc.</span>
          <span>RA 10173 compliant</span>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="mt-16 px-4 leading-none text-center select-none" aria-hidden>
        <div
          className="font-display tracking-[-0.02em]"
          style={{
            color: "var(--green-deep)",
            fontSize: "clamp(4rem, 22vw, 22rem)",
            lineHeight: 0.85,
          }}
        >
          GENESCOPE
        </div>
      </div>
    </footer>
  );
}
