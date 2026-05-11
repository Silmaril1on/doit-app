"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { TbError404 } from "react-icons/tb";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#0c0c0c]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ delay: 0.4, duration: 0.9, ease: "easeInOut" }}
          className="text-yellow-400"
        >
          <TbError404 size={120} />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-5xl font-black uppercase text-yellow-400 leading-none tracking-wide">
            Page Not Found
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            The route you&apos;re looking for doesn&apos;t exist. Go back to the
            app.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-yellow-400/60 bg-yellow-400/10 text-yellow-400 text-sm uppercase font-bold tracking-wide hover:bg-yellow-400/20 transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
