import { useState } from "react";

export function useColumnToggle(defaultColumns: string[]) {
  const [visible, setVisible] = useState<Set<string>>(new Set(defaultColumns));

  const toggle = (col: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });
  };

  const isVisible = (col: string) => visible.has(col);

  return { visible, toggle, isVisible };
}
