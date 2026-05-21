import { ReactNode, useEffect, useState } from "react";

export function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className={`rounded-2xl bg-card text-card-foreground p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-card-foreground/65">{description}</p>
        )}
      </div>
      <div className="h-64 w-full relative">{mounted ? children : null}</div>
    </div>
  );
}
