import { AlertTriangle, Info, RefreshCw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AIDisclaimer({ variant = "default" }: { variant?: "default" | "research" }) {
  return (
    <p
      role="note"
      className="flex gap-2 rounded-lg border border-border bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground"
    >
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        AI-generated content is provided for productivity assistance and may contain errors or
        omissions. Always review important information before relying on it. AI outputs should not
        be treated as professional, legal, financial, medical or other expert advice.
        {variant === "research" &&
          " Verify important facts and sources independently before using AI-generated research in academic, professional or public-facing work."}
      </span>
    </p>
  );
}

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-border p-10 text-center">
      <Sparkles aria-hidden className="mb-3 size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {message ?? "Your AI-generated results will appear here."}
      </p>
    </div>
  );
}

export function LoadingState({ label = "Analyzing your information..." }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw aria-hidden className="size-4 animate-spin text-accent" />
        {label}
      </p>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm"
    >
      <p className="flex items-center gap-2 font-medium text-destructive">
        <AlertTriangle aria-hidden className="size-4" />
        Something went wrong. Please check your input and try again.
      </p>
      {message && <p className="mt-2 text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button className="mt-4" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden className="size-4" /> Retry
        </Button>
      )}
    </div>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  const styles =
    p === "high"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : p === "medium"
        ? "bg-warning/15 text-warning-foreground border-warning/40"
        : p === "break"
          ? "bg-secondary text-secondary-foreground border-border"
          : p === "low"
            ? "bg-success/10 text-success border-success/30"
            : "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      {priority}
    </span>
  );
}
