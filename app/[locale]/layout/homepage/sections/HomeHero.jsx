"use client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/app/[locale]/components/buttons/Button";
import Image from "next/image";
import Link from "next/link";

const HomeHero = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <section
      id="hero"
      className="relative bg-black w-full h-72 lg:min-h-screen flex "
    >
      <BackgroundSide />
      <ContentSide locale={locale} />
      {/* <ActionSide /> */}
      {/* <BackgroundSlider /> */}
    </section>
  );
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
    },
  },
};

const buttonVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // easeOutBack (slight bounce)
    },
  },
};

const ContentSide = ({ locale }) => {
  return (
    <motion.div
      className="relative z-5 flex  flex-col w-2/5 pl-10 h-full items-start justify-center  "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* h2 */}
      <motion.h2 className="text-cream mb-3" variants={fadeUpVariants}>
        some inspiration text in phil
      </motion.h2>

      {/* h1 */}
      <motion.h1 className="text-5xl text-primary" variants={fadeUpVariants}>
        This is a Hook Headline for the users
      </motion.h1>

      {/* paragraph */}
      <motion.p
        className="text-cream/80 secondary text-sm mt-4 leading-normal"
        variants={fadeUpVariants}
      >
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae
        molestias aperiam natus distinctio, hic nemo omnis quibusdam eius
        cupiditate nesciunt blanditiis inventore voluptate et, quidem sapiente
        ipsum sit. Error odio suscipit asperiores libero vel, nulla quibusdam id
        beatae accusantium laboriosam, incidunt, dignissimos nihil. Error
        molestiae nihil, nam reprehenderit placeat perferendis.
      </motion.p>

      {/* buttons row */}
      <motion.div
        className="w-full mt-10 flex space-x-5"
        variants={containerVariants}
      >
        <motion.div variants={buttonVariants}>
          <Link href={`/register`}>
            <Button text="GET started" />
          </Link>
        </motion.div>

        <motion.div variants={buttonVariants}>
          <Link href={`/${locale}/login`}>
            <Button text="Register" variant="outline" />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const ActionSide = () => {
  return <div></div>;
};

const BackgroundSlider = () => {
  return (
    <div className="center absolute inset-0 z-1 bg-black"> hello slider</div>
  );
};

const BackgroundSide = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 w-full z-2 overflow-hidden h-72 lg:h-screen"
    >
      {/* Base image */}
      <motion.div
        className="absolute inset-0 blur-[1px]"
        animate={{
          opacity: [1, 1, 1, 0.92, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/hero-wp.png"
          alt="hero image"
          fill
          className="object-contain  w-full"
          priority
        />
      </motion.div>

      {/* Glitch layer */}
      <motion.div
        className="absolute inset-0 -left-5"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0, 0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.1, 0.15, 0.4, 0.45, 1],
          ease: "easeInOut",
        }}
      >
        <Image
          src="/glitch-hero-wp.png"
          alt="glitch hero image"
          fill
          className="object-contain w-full"
          priority
        />
      </motion.div>
      <div className="absolute h-20 w-full bottom-0 bg-linear-to-t from-black to-transparent" />
      <div
        className="
          pointer-events-none
          absolute inset-0
          z-0
        "
        style={{
          background: `
            radial-gradient(
              circle at center,
              transparent 0%,
              transparent 43%,
              rgba(0,0,0,0.15) 47%,
              rgba(0,0,0,0.45) 52%,
              rgba(0,0,0,0.75) 57%,
              rgba(0,0,0,0.95) 65%,
              #000 100%
            )
          `,
        }}
      />
    </motion.div>
  );
};

export default HomeHero;
