"use client";
import { motion } from "framer-motion";
import {
  fadeVariant,
  slideLeftVariant,
  slideRightVariant,
  slideTopVariant,
  slideBottomVariant,
  scaleVariant,
} from "./animations";

const Motion = ({
  children,
  className = "",
  animation,
  stagger = false,
  delay = 0,
  onClick,
  onMouseEnter,
  onMouseLeave,
  initial = "hidden",
  animate = "visible",
  exit = "exit",
  whileInView = false,
  ...props
}) => {
  const motionVariants = {
    fade: "fadeVariant",
    left: "slideLeftVariant",
    right: "slideRightVariant",
    top: "slideTopVariant",
    bottom: "slideBottomVariant",
    scale: "scaleVariant",
  };

  const getAnimationVariant = () => {
    if (!animation || animation === "none") return null;
    const variantName = motionVariants[animation];
    if (!variantName) return null;
    return {
      fadeVariant,
      slideLeftVariant,
      slideRightVariant,
      slideTopVariant,
      slideBottomVariant,
      scaleVariant,
    }[variantName];
  };

  const getChildVariants = (animationType) => {
    const baseVariant = getAnimationVariant();
    if (!baseVariant) return null;
    return {
      hidden: baseVariant.initial,
      visible: {
        ...baseVariant.animate,
        transition: {
          ...baseVariant.animate.transition,
          staggerChildren: undefined,
          delayChildren: undefined,
        },
      },
      exit: {
        ...baseVariant.exit,
        transition: {
          ...baseVariant.exit.transition,
          staggerChildren: undefined,
          delayChildren: undefined,
        },
      },
    };
  };

  const animationVariantBase = getAnimationVariant();
  const animationVariant = animationVariantBase
    ? {
        hidden: { ...animationVariantBase.initial },
        visible: {
          ...animationVariantBase.animate,
          transition: {
            ...animationVariantBase.animate?.transition,
            delay:
              (animationVariantBase.animate?.transition?.delay || 0) + delay,
          },
        },
        exit: animationVariantBase.exit
          ? {
              ...animationVariantBase.exit,
              transition: {
                ...animationVariantBase.exit?.transition,
                delay:
                  (animationVariantBase.exit?.transition?.delay || 0) + delay,
              },
            }
          : undefined,
      }
    : null;
  const childVariants = getChildVariants(animation);
  const isMotion = !!animationVariant;

  if (isMotion) {
    const animationProps = whileInView
      ? {
          whileInView: animate,
          viewport: { once: true, amount: 0.05, margin: "50px" },
          initial: initial,
        }
      : {
          animate: animate,
          initial: initial,
        };

    if (stagger) {
      return (
        <motion.div
          variants={animationVariant}
          initial={initial}
          exit={exit}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          className={className}
          {...animationProps}
          {...props}
        >
          {Array.isArray(children) ? (
            children.map((child, index) => (
              <motion.div key={index} variants={childVariants}>
                {child}
              </motion.div>
            ))
          ) : (
            <motion.div variants={childVariants}>{children}</motion.div>
          )}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          variants={animationVariant}
          initial={initial}
          exit={exit}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          className={className}
          {...animationProps}
          {...props}
        >
          {children}
        </motion.div>
      );
    }
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default Motion;
