"use client";
import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiMap,
  HiUsers,
  HiStar,
  HiLightningBolt,
  HiAdjustments,
} from "react-icons/hi";
import ItemCard from "@/app/[locale]/components/container/ItemCard";

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

const HomeFeatured = () => {
  return (
    <section id="features" className="px-6 py-16 max-w-5xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="mb-10 text-center"
      >
        <h2 className="primary text-3xl sm:text-4xl text-cream mb-2">
          Everything you need to <span className="text-primary">level up</span>
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
  );
};

export default HomeFeatured;
