"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TbAlertCircle } from "react-icons/tb";
import Button from "./components/buttons/Button";

export default function Error({ error, reset }) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -6, 6, -3, 3, 0] }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="text-red-600"
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
          <Button variant="outline" onClick={reset} text="Try Again" />
          <Button href={`/${locale}`} text="Go Home" />
        </div>
      </motion.div>
    </div>
  );
}
