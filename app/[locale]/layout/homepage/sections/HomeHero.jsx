"use client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/app/[locale]/components/buttons/Button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Twinkles from "@/app/[locale]/components/elements/Twinkles";

const HomeHero = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <section
      id="hero"
      className="relative bg-black w-full h-screen lg:min-h-screen flex flex-col"
    >
      <BackgroundSide />
      <ContentSide locale={locale} />
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
      className="w-full lg:w-[50%] h-full relative z-10 flex flex-col items-center lg:items-start px-4 lg:pl-10 justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* h2 */}
      <motion.h2 className="text-cream mb-3" variants={fadeUpVariants}>
        some inspiration text in phil
      </motion.h2>

      {/* h1 */}
      <motion.h1
        className="text-lg lg:text-5xl text-primary"
        variants={fadeUpVariants}
      >
        This is a Hook Headline for the users
      </motion.h1>

      {/* paragraph */}
      <motion.p
        className="text-cream/80 secondary text-xs lg:text-sm mt-4 leading-normal text-center lg:text-start"
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
        className="w-full mt-10 flex justify-center lg:justify-start  space-x-5"
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

const BackgroundSide = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative lg:absolute lg:w-[60%] right-0 z-2 overflow-hidden h-175 w-full lg:h-screen "
    >
      <Twinkles />
      <div className="mt-10 relative z-1">
        <video ref={videoRef} autoPlay muted loop playsInline>
          <source src="/videos/earth.webm" type="video/webm" />
        </video>
      </div>
      {/* Base image */}
      <motion.div
        className="absolute h-full inset-0 blur-[1px] z-2"
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
          className="object-cover  w-full"
          priority
        />
      </motion.div>

      {/* Glitch layer */}
      <motion.div
        className="absolute inset-0 -left-5 z-2"
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
          className="object-cover w-full"
          priority
        />
      </motion.div>
      <div className="absolute z-3 h-10 w-full bottom-0 bg-linear-to-t from-black to-transparent" />
      <div
        className=" pointer-events-none z-3 absolute inset-0 "
        style={{
          background: `
            radial-gradient(
              circle at center,
              transparent 0%,
              transparent 55%,
              rgba(0,0,0,0.15) 60%,
              rgba(0,0,0,0.45) 71%,
              rgba(0,0,0,0.75) 78%,
              rgba(0,0,0,0.95) 90%,
              #000 100%
            )
          `,
        }}
      />
    </motion.div>
  );
};

export default HomeHero;
