import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OpsCardProps {
  title?: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  noHeader?: boolean;
}

export function OpsCard({
  title,
  subtitle,
  icon,
  children,
  className,
  headerRight,
  noHeader,
}: OpsCardProps) {
  return (
    <div className={cn("ops-card ops-card-accent", className)}>
      <div className="ops-accent-line" />
      {!noHeader && title && (
        <div
          className="ops-card-header flex items-start justify-between"
        >
          <div>
            <div
              className="ops-card-title flex items-center gap-2"
            >
              {icon}
              {title}
            </div>
            {subtitle && <div className="ops-card-subtitle">{subtitle}</div>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
