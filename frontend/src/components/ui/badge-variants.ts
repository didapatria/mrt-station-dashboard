import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-muted text-foreground",
        destructive: "border-transparent bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        outline: "border-border text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
