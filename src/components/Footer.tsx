import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-foreground/15">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-20 pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr_1fr] gap-12 items-start">
          <div>
            <div className="display-lg">
              Decisions,<br />
              <span className="text-coral">without the guesswork.</span>
            </div>
            <p className="mt-6 max-w-md text-sm text-foreground/75 leading-relaxed">
              GeneScope is a thesis research project at FEU Institute of Technology,
              developed in partnership with Molave Trading Inc. under MOA and NDA.
            </p>
          </div>

          <div>
            <div className="eyebrow text-foreground/60 mb-4">Navigate</div>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/predict", label: "Predict" },
                { to: "/dashboard", label: "Dashboard" },
                { to: "/performance", label: "Performance" },
                { to: "/history", label: "History" },
                { to: "/about", label: "About" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-coral transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow text-foreground/60 mb-4">Compliance</div>
            <ul className="space-y-2 text-sm text-foreground/85">
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" /> RA 10173 Data Privacy Act
              </li>
              <li className="inline-flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Local environment only
              </li>
              <li>Anonymized · No PII</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-foreground/15 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60">
          <div>© {new Date().getFullYear()} GeneScope · FEU Institute of Technology</div>
          <div>Data partner: Molave Trading Inc. (Confidential)</div>
        </div>
      </div>
    </footer>
  );
}
