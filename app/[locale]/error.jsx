"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TbAlertCircle } from "react-icons/tb";

export default function Error({ error, reset }) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -6, 6, -3, 3, 0] }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="text-red-400"
        >
          <TbAlertCircle size={100} />
        </motion.div>

        <div className="space-y-3">
          <h1 className="primary text-4xl uppercase text-primary text-shadow leading-none">
            Something Went Wrong
          </h1>
          <p className="secondary text-chino/60 text-sm leading-relaxed">
            {error?.message ||
              "An unexpected error occurred. Please try again."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary/20 border border-primary/60 text-primary primary text-sm uppercase tracking-wide hover:bg-primary/30 transition-colors duration-200 cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-primary/30 text-chino/70 secondary text-sm hover:text-chino hover:border-primary/50 transition-colors duration-200"
          >
            ← Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
