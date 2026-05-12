"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

const LINKS = [
  { href: "/game-settings/achievements", label: "Achievements" },
  { href: "/game-settings/customization", label: "Customization" },
  { href: "/game-settings/difficulty", label: "Difficulty" },
  { href: "/game-settings/statistics", label: "Statistics" },
  { href: "/game-settings/security", label: "Security" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -40, scale: 0.5 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 12,
      mass: 0.8,
    },
  },
};

const SettingsPage = () => {
  return (
    <div className="page-wrapper center flex-col gap-3">
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-3"
      >
        {LINKS.map(({ href, label }) => (
          <motion.div
            key={href}
            variants={itemVariants}
            whileHover={{
              scale: 1.08,
              x: 20,
              transition: { type: "spring", stiffness: 500, damping: 14 },
            }}
            whileTap={{ scale: 0.94 }}
          >
            <Link
              href={href}
              className="text-4xl lg:text-6xl text-primary/80 hover:text-primary duration-200 block text-shadow-white]"
            >
              {label}
            </Link>
          </motion.div>
        ))}
      </motion.nav>
    </div>
  );
};

export default SettingsPage;
