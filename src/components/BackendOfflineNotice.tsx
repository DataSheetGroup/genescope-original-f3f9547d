import { AlertTriangle, RefreshCw } from "lucide-react";

export function BackendOfflineNotice({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-2xl bg-card text-card-foreground p-7 flex items-start gap-4">
      <AlertTriangle className="h-5 w-5 text-coral shrink-0 mt-1" />
      <div className="flex-1">
        <p className="font-display text-2xl">Backend unreachable.</p>
        <p className="text-sm text-card-foreground/75 mt-2">
          Make sure the Flask server is running at{" "}
          <code className="px-1.5 py-0.5 rounded bg-green-deep/10 text-xs font-mono">localhost:5000</code>.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 pill pill-coral text-xs px-4 py-2"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
