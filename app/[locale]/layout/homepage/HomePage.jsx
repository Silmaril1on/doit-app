"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QA_DATA } from "@/app/[locale]/lib/local-bd/qa";
import {
  HiOutlineChevronDown,
  HiCheckCircle,
  HiMap,
  HiUsers,
  HiStar,
  HiLightningBolt,
  HiAdjustments,
} from "react-icons/hi";
import ItemCard from "../../components/container/ItemCard";
import BorderSvg from "../../components/elements/BorderSvg";

// ── QA Accordion ──────────────────────────────────────────────────────────────
const AccordionItem = ({ item, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
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

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    <ItemCard className="space-y-3 h-full">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/15 border border-primary/25 text-primary text-xl">
        {icon}
      </div>
      <h3 className="primary text-lg text-cream">{title}</h3>
      <p className="secondary text-[13px] text-chino/70 leading-relaxed">
        {desc}
      </p>
    </ItemCard>
  </motion.div>
);

const FEATURES = [
  {
    icon: <HiCheckCircle />,
    title: "Task Engine",
    desc: "Create rich tasks with subtasks, priorities, and location pins. Turn any real-world goal into a trackable objective.",
  },
  {
    icon: <HiLightningBolt />,
    title: "XP & Levels",
    desc: "Earn experience points for every completed task. Harder tasks reward more XP — your level reflects your real-world output.",
  },
  {
    icon: <HiStar />,
    title: "Achievement Badges",
    desc: "Unlock bronze-to-platinum tier badges across dozens of categories. Each badge is a trophy for genuine real-life progress.",
  },
  {
    icon: <HiMap />,
    title: "World Explorer",
    desc: "Pin tasks to cities and countries. Watch your global footprint grow and unlock continent badges as you explore.",
  },
  {
    icon: <HiUsers />,
    title: "Friends & Feed",
    desc: "Follow friends, celebrate their wins, and stay motivated together through a live social activity feed.",
  },
  {
    icon: <HiAdjustments />,
    title: "Full Customisation",
    desc: "Choose your colour theme, difficulty level, and sound preferences. DoIt adapts to your style, not the other way around.",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 overflow-hidden">
        {/* Background glow blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-125 h-75 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <span className="secondary text-[11px] uppercase tracking-[0.2em] text-primary/80 border border-primary/20 rounded-full px-4 py-1.5 bg-primary/5">
            Level up your real life
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="primary text-6xl sm:text-8xl text-cream mb-4 leading-none"
        >
          Do<span className="text-primary">It</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="secondary text-base sm:text-lg text-cream/50 max-w-md mb-10 leading-relaxed"
        >
          Complete real tasks. Earn XP. Unlock badges. Explore the world.
          <br />
          The only productivity app that rewards you for living.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/register"
            className="primary text-lg px-8 py-3 rounded-xl bg-primary text-black hover:bg-primary/80 transition-all duration-300 shadow-[0_0_22px_4px_rgba(252,185,19,0.3)] hover:shadow-[0_0_36px_8px_rgba(252,185,19,0.45)] hover:scale-[1.04]"
          >
            Get Started — Free
          </Link>
          <Link
            href="/login"
            className="secondary text-sm px-6 py-3 rounded-xl border border-primary/20 text-cream/60 hover:text-cream hover:border-primary/50 transition-all duration-200"
          >
            Sign in
          </Link>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <h2 className="primary text-3xl sm:text-4xl text-cream mb-2">
            Everything you need to{" "}
            <span className="text-primary">level up</span>
          </h2>
          <p className="secondary text-sm text-cream/40 max-w-sm mx-auto">
            Built for people who get things done in the real world.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── QA ───────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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

        <div className="flex flex-col gap-2">
          {QA_DATA.map((item, i) => (
            <AccordionItem key={i} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
