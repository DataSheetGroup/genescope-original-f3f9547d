import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            <div className="font-semibold text-foreground">FEU Institute of Technology</div>
            <div className="mt-1">
              Data Partner: Molave Trading Inc. (Confidential)
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> RA 10173 Compliant
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Local Environment
            </span>
            <span>© {new Date().getFullYear()} GeneScope</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
