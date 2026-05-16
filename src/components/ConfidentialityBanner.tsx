import { Lock } from "lucide-react";

export function ConfidentialityBanner() {
  return (
    <div className="bg-warning text-warning-foreground">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wider uppercase">
        <Lock className="h-3 w-3" />
        Private &amp; Confidential — For Internal Use Only
      </div>
    </div>
  );
}
