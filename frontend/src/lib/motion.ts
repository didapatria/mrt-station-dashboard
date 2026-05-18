/**
 * Signal OS — Motion System
 * Unified Framer Motion variant library for MRT Station Dashboard.
 *
 * Usage:
 *   import { fadeUp, stagger, slideIn, scaleIn } from "@/lib/motion";
 *   <motion.div variants={stagger.container} initial="hidden" animate="visible">
 *     <motion.div variants={stagger.item}>...</motion.div>
 *   </motion.div>
 */

import type { Variants, Transition } from "framer-motion";

// ─── Duration tokens ────────────────────────────────────────────────────────
export const duration = {
  instant: 0.08,
  fast: 0.15,
  base: 0.22,
  slow: 0.35,
  slower: 0.5,
} as const;

// ─── Easing tokens ──────────────────────────────────────────────────────────
export const ease = {
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  enter: [0, 0, 0.2, 1] as [number, number, number, number],
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

// ─── Page transitions ────────────────────────────────────────────────────────
/** Used in DashboardLayout AnimatePresence wrapper */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

// ─── Fade variants ───────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.smooth },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.base, ease: ease.smooth },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.smooth },
  },
};

// ─── Slide variants ──────────────────────────────────────────────────────────
export const slideIn = {
  left: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.slow, ease: ease.smooth },
    },
  } as Variants,
  right: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.slow, ease: ease.smooth },
    },
  } as Variants,
};

// ─── Scale variants ──────────────────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

/** Modal / dialog enter */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springGentle,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: duration.fast, ease: ease.exit },
  },
};

// ─── Stagger containers ──────────────────────────────────────────────────────
/**
 * Standard stagger — wraps a list of items.
 *
 * Usage:
 *   <motion.ul variants={stagger.container} initial="hidden" animate="visible">
 *     {items.map(i => <motion.li key={i} variants={stagger.item}>...</motion.li>)}
 *   </motion.ul>
 */
export const stagger = {
  container: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  } as Variants,
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.base, ease: ease.smooth },
    },
  } as Variants,
};

/** Faster stagger for dense lists (table rows, chips) */
export const staggerFast = {
  container: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.035, delayChildren: 0 },
    },
  } as Variants,
  item: {
    hidden: { opacity: 0, x: -6 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: duration.fast, ease: ease.smooth },
    },
  } as Variants,
};

// ─── Micro-interaction props (spread directly onto motion elements) ───────────
/** Card hover lift */
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: duration.fast } },
  whileTap: { scale: 0.98, transition: { duration: duration.instant } },
};

/** Button press */
export const hoverPress = {
  whileHover: { scale: 1.02, transition: { duration: duration.fast } },
  whileTap: { scale: 0.97, transition: { duration: duration.instant } },
};

/** Icon pulse on hover */
export const hoverPulse = {
  whileHover: {
    scale: 1.1,
    transition: { duration: duration.fast, ease: ease.bounce },
  },
};

// ─── Skeleton shimmer (CSS-based, no JS needed) ──────────────────────────────
/** Add this className to a skeleton element. Define keyframes in index.css */
export const SKELETON_CLASS = "animate-skeleton";

// ─── Reduced motion guard ────────────────────────────────────────────────────
/**
 * Returns safe variants that respect prefers-reduced-motion.
 * Pass `reducedMotion` from Framer Motion's `useReducedMotion()`.
 *
 * Usage:
 *   const reducedMotion = useReducedMotion();
 *   <motion.div variants={safeVariants(fadeUp, reducedMotion)} ... />
 */
export function safeVariants(
  variants: Variants,
  reduced: boolean | null,
): Variants {
  if (!reduced) return variants;
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0 } },
    exit: { opacity: 0, transition: { duration: 0 } },
  };
}
