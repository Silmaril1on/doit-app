"use client";
import { useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

const SPRING = { type: "spring", stiffness: 300, damping: 30 };
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

const SwiperMode = ({
  children,
  items = [],
  cardWidth = 300,
  spacing = 12,
  mobileOnly = false,
  className = "",
  onIndexChange,
  restrictFirstSwipeBack = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const total = items.length;
  const stepSize = cardWidth + spacing;

  const goTo = (index) => {
    const next = Math.max(0, Math.min(index, total - 1));
    setActiveIndex(next);
    animate(x, -(next * stepSize), SPRING);
    onIndexChange?.(next);
  };

  const handleDragEnd = (_, info) => {
    const movedFar = Math.abs(info.offset.x) > DRAG_THRESHOLD;
    const movedFast = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;
    if (movedFar || movedFast) {
      // Restrict swiping back when at index 0
      if (restrictFirstSwipeBack && activeIndex === 0 && info.offset.x > 0) {
        goTo(0);
        return;
      }
      goTo(info.offset.x < 0 ? activeIndex + 1 : activeIndex - 1);
    } else {
      goTo(activeIndex);
    }
  };

  const visibilityClass = mobileOnly ? "block lg:hidden" : "block";

  return (
    <div className={`${visibilityClass} ${className}`}>
      {/* clip to one card width */}
      <div
        className="overflow-hidden"
        style={{ width: `${cardWidth}px`, margin: "0 auto" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: -(total - 1) * stepSize, right: 0 }}
          dragElastic={0.08}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="flex cursor-grab active:cursor-grabbing"
        >
          {/* wrap each child so it stays exactly cardWidth wide */}
          {Array.isArray(children) ? (
            children.map((child, i) => (
              <div
                key={i}
                style={{
                  minWidth: `${cardWidth}px`,
                  marginRight: `${i < total - 1 ? spacing : 0}px`,
                }}
              >
                {child}
              </div>
            ))
          ) : (
            <div style={{ minWidth: `${cardWidth}px` }}>{children}</div>
          )}
        </motion.div>
      </div>

      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 cursor-pointer rounded-full bg-teal-400 transition-all duration-300 ${
                i === activeIndex ? "w-6" : "w-2 opacity-40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CarouselMode = ({
  children,
  items = [],
  itemsPerPage = 6,
  cardWidth = 236,
  cardMargin = 8,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerWidth = itemsPerPage * (cardWidth + 2 * cardMargin);
  const stepSize = cardWidth + 2 * cardMargin;

  const slideNext = () =>
    setCurrentIndex((prev) =>
      Math.min(prev + itemsPerPage, items.length - itemsPerPage),
    );

  const slidePrev = () =>
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));

  const isLeftVisible = currentIndex > 0;
  const isRightVisible = currentIndex + itemsPerPage < items.length;

  return (
    <div
      className={`relative flex flex-col items-center group/slider ${className}`}
    >
      <div
        style={{
          overflow: "hidden",
          width: `${containerWidth}px`,
          minHeight: "300px",
        }}
      >
        <div
          style={{
            transform: `translateX(-${currentIndex * stepSize}px)`,
            width: `${stepSize * items.length}px`,
            transition: "transform 600ms ease-in-out",
            display: "flex",
            alignItems: "center",
            minHeight: "280px",
          }}
        >
          <div
            className="flex flex-row"
            style={{ minHeight: "280px", width: "100%" }}
          >
            {children}
          </div>
        </div>
      </div>

      {isLeftVisible && (
        <button
          onClick={slidePrev}
          className="absolute z-20 top-1/2 -translate-y-1/2 left-4 opacity-0 group-hover/slider:opacity-100 cursor-pointer border bg-black border-teal-500 text-teal-400 py-3 text-2xl pr-1 w-5 flex items-center justify-center hover:brightness-100 duration-300"
        >
          <FaCaretLeft />
        </button>
      )}

      {isRightVisible && (
        <button
          onClick={slideNext}
          className="absolute z-20 top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover/slider:opacity-100 cursor-pointer border bg-black border-teal-500 text-teal-400 py-3 text-2xl pl-1 w-5 flex items-center justify-center hover:brightness-100 duration-300"
        >
          <FaCaretRight />
        </button>
      )}
    </div>
  );
};

const Swiper = ({ swiper, carousel, ...props }) => {
  if (carousel) return <CarouselMode {...props} />;
  return <SwiperMode {...props} />;
};

export default Swiper;
