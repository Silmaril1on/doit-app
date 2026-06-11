"use client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Button from "@/app/[locale]/components/buttons/Button";
import Link from "next/link";

const GlobeSide = dynamic(() => import("./GlobeSide"), { ssr: false });

const HomeHero = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <section
      id="hero"
      className="relative bg-black w-full h-screen grid lg:grid-cols-2"
    >
      <ContentSide locale={locale} />
      <GlobeSide />
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
      className="w-full h-full relative z-10 flex flex-col items-center lg:items-start px-4 lg:pl-10 justify-center"
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

export default HomeHero;
