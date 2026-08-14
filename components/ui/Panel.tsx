import type { ReactNode } from "react";

export function Panel({
  children,
  raised,
  className = "",
}: {
  children: ReactNode;
  raised?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border p-5 ${
        raised ? "bg-panel-raised" : "bg-panel"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-wider text-ink-dim mb-3">{children}</h2>
  );
}
