export const fadeVariant = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideLeftVariant = {
  initial: { x: -200, scale: 0.8, opacity: 0 },
  animate: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: -200,
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideRightVariant = {
  initial: { x: 200, scale: 0.5, opacity: 0 },
  animate: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: 200,
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideTopVariant = {
  initial: { y: -40, scale: 0.8, opacity: 0 },
  animate: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: -40,
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideBottomVariant = {
  initial: { y: 40, scale: 0.8, opacity: 0 },
  animate: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: 40,
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scaleVariant = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stagger container — use directly on a motion.div wrapping badge grids.
// Children should use badgeCardVariant (via <Motion animation="badgeCard" orchestrated>).
export const staggerContainerVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

// Individual badge card: opacity + subtle x-slide + scale pop.
export const badgeCardVariant = {
  initial: { opacity: 0, x: -8, scale: 0.88 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -8,
    scale: 0.88,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};
