"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { QA_DATA } from "@/app/[locale]/lib/local-bd/qa";
import { HiOutlineChevronDown } from "react-icons/hi";
import ItemCard from "@/app/[locale]/components/container/ItemCard";

const HomeQa = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="px-6 py-16 max-w-3xl mx-auto w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.45 }}
        className="mb-8 text-center"
      >
        <h2 className="primary text-3xl sm:text-4xl text-cream mb-2">
          Got <span className="text-primary">questions?</span>
        </h2>
        <p className="secondary text-sm text-cream/40">
          Everything you need to know about DoIt.
        </p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {QA_DATA.map((item, i) => (
          <AccordionItem key={i} item={item} index={i} isInView={isInView} />
        ))}
      </div>
    </section>
  );
};

const AccordionItem = ({ item, index, isInView }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <ItemCard className="p-5" onClick={() => setOpen((v) => !v)}>
        <button
          className="flex items-center justify-between w-full group cursor-pointer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-sm  text-cream/90 text-shadow group-hover:text-cream duration-300 tracking-[1px]">
            {item.question}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 text-primary text-lg"
          >
            <HiOutlineChevronDown />
          </motion.span>
        </button>
      </ItemCard>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-primary/10 bg-black/20">
              <p className="secondary text-sm text-cream/60 leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomeQa;
