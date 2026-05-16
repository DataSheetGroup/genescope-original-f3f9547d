import { AlertTriangle, RefreshCw } from "lucide-react";

export function BackendOfflineNotice({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 flex items-start gap-4">
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-foreground">
          Unable to reach GeneScope backend.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please ensure the Flask server is running at{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-xs">localhost:5000</code>.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        )}
      </div>
    </div>
  );
}
