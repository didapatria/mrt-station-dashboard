import type { CSSProperties } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import type { SortConfig } from "@/hooks/use-sortable";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps<T> {
  label: string;
  sortKey: keyof T;
  sortConfig: SortConfig<T>;
  onSort: (key: keyof T) => void;
  className?: string;
  style?: CSSProperties;
}

export function SortableTableHead<T extends object>({
  label,
  sortKey,
  sortConfig,
  onSort,
  className,
  style,
}: SortableTableHeadProps<T>) {
  const isActive = sortConfig.key === sortKey;

  return (
    <TableHead
      className={cn("cursor-pointer select-none", className)}
      style={style}
    >
      <button
        className="flex items-center gap-1.5 hover:text-foreground transition-colors -ml-1 px-1 py-0.5 rounded"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5 text-primary" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-primary" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
