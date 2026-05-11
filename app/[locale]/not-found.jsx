"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TbError404 } from "react-icons/tb";
import Button from "./components/buttons/Button";

export default function NotFound() {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        {/* Big 404 icon */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ delay: 0.4, duration: 0.9, ease: "easeInOut" }}
          className="text-primary"
        >
          <h1 className="text-9xl text-shadow-[5px_4px_7px_rgba(255,240,220,0.5)]">
            404
          </h1>
        </motion.div>

        <div className="space-y-3">
          <h1 className="primary text-5xl uppercase text-primary leading-none text-shadow-[5px_4px_7px_rgba(255,240,220,0.5)]">
            Page Not Found
          </h1>
          <p className="secondary text-chino/60 text-sm leading-relaxed">
            The route you&apos;re looking for doesn&apos;t exist or was moved.
            Double-check the URL, or head back to safety.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="outline" href={`/${locale}`} text="Back to Home" />
        </motion.div>
      </motion.div>
    </div>
  );
}
