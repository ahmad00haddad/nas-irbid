import { Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, ArrowRight, WifiOff } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Action button label and handler */
  action?: { label: string; onClick: () => void };
  /** Optional back link */
  backTo?: { to: string; label: string };
  variant?: "network" | "notfound" | "generic";
}

export function ErrorState({
  title = "حدث خطأ",
  description = "تعذّر تحميل هذا المحتوى. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.",
  action,
  backTo,
  variant = "generic",
}: ErrorStateProps) {
  const Icon = variant === "network" ? WifiOff : AlertTriangle;

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-card p-10 text-center shadow-deep">
      <div className="inline-flex w-14 h-14 rounded-2xl bg-destructive/10 items-center justify-center mb-5">
        <Icon size={24} className="text-destructive" />
      </div>
      <h2 className="font-display text-2xl text-foreground mb-3">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-7">{description}</p>

      <div className="flex flex-wrap gap-3 justify-center">
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-glow hover:opacity-90 transition"
          >
            <RefreshCw size={14} />
            {action.label}
          </button>
        )}
        {backTo && (
          <Link
            to={backTo.to as "/"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground font-bold text-sm hover:border-primary/60 transition"
          >
            <ArrowRight size={14} />
            {backTo.label}
          </Link>
        )}
      </div>
    </div>
  );
}

/** Inline mini error for inside cards/sections */
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-sm text-foreground">
      <AlertTriangle size={16} className="text-destructive shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 text-xs font-bold text-primary hover:underline">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
