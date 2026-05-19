/**
 * Skeleton — Loading state components
 * Consistent shimmer-based skeleton loaders for all pages.
 *
 * Usage:
 *   <SkeletonCard />           — standard card placeholder
 *   <SkeletonRow />            — table row placeholder
 *   <SkeletonStatCard />       — dashboard stat card placeholder
 *   <SkeletonText lines={3} /> — text block placeholder
 *   <SkeletonAvatar size={36} /> — avatar circle placeholder
 */

import React from "react";
import { cn } from "@/lib/utils";

// Base skeleton block — all variants build on this
function SkeletonBase({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("skeleton-shimmer bg-muted rounded-[6px]", className)}
      style={style}
    />
  );
}

// ─── Skeleton primitives ──────────────────────────────────────────────────────

export function SkeletonText({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          style={{
            height: 12,
            width: i === lines - 1 && lines > 1 ? "65%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 36 }: { size?: number }) {
  return (
    <SkeletonBase
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

// ─── Composite skeletons ──────────────────────────────────────────────────────

/** Dashboard stat card (number + label + icon) */
export function SkeletonStatCard() {
  return (
    <div className="skeleton-card p-[20px_24px]">
      <SkeletonBase style={{ height: 2, marginBottom: 20, borderRadius: 0 }} />
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <SkeletonBase style={{ height: 9, width: 80, marginBottom: 10 }} />
          <SkeletonBase style={{ height: 36, width: 64, marginBottom: 8 }} />
          <SkeletonBase style={{ height: 9, width: 100 }} />
        </div>
        <SkeletonBase style={{ width: 40, height: 40, borderRadius: 10 }} />
      </div>
    </div>
  );
}

/** Table row with avatar + name + meta cells */
export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      <td className="p-3 px-4">
        <div className="flex items-center gap-2.5">
          <SkeletonAvatar size={32} />
          <div className="flex-1">
            <SkeletonBase style={{ height: 11, width: 120, marginBottom: 5 }} />
            <SkeletonBase style={{ height: 9, width: 80 }} />
          </div>
        </div>
      </td>
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <td key={i} className="p-3 px-4">
          <SkeletonBase style={{ height: 11, width: i === 0 ? 90 : 60 }} />
        </td>
      ))}
    </tr>
  );
}

/** Full card with header + content */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-card">
      <SkeletonBase style={{ height: 2, borderRadius: 0 }} />
      <div className="skeleton-header flex justify-between items-center">
        <div>
          <SkeletonBase style={{ height: 16, width: 120, marginBottom: 6 }} />
          <SkeletonBase style={{ height: 9, width: 80 }} />
        </div>
        <SkeletonBase style={{ height: 28, width: 72, borderRadius: 6 }} />
      </div>
      <div className="py-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-[10px_24px]"
            style={{
              borderBottom: i < rows - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <SkeletonBase style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div className="flex-1">
              <SkeletonBase style={{ height: 10, width: "60%", marginBottom: 5 }} />
              <SkeletonBase style={{ height: 9, width: "40%" }} />
            </div>
            <SkeletonBase style={{ height: 20, width: 52, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Table with N skeleton rows */
export function SkeletonTable({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="skeleton-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3 px-4 text-left">
                <SkeletonBase style={{ height: 9, width: i === 0 ? 80 : 50 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Profile section skeleton */
export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-[20px_24px]">
      <SkeletonAvatar size={64} />
      <div className="flex-1">
        <SkeletonBase style={{ height: 22, width: 160, marginBottom: 8 }} />
        <SkeletonBase style={{ height: 10, width: 100, marginBottom: 6 }} />
        <SkeletonBase style={{ height: 18, width: 70, borderRadius: 4 }} />
      </div>
    </div>
  );
}
