import { useState } from "react";

export function useColumnToggle(defaultColumns: string[]) {
  const [visible, setVisible] = useState<Set<string>>(new Set(defaultColumns));

  const toggle = (col: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(col)) { next.delete(col); } else { next.add(col); }
      return next;
    });
  };

  const isVisible = (col: string) => visible.has(col);

  return { visible, toggle, isVisible };
}
