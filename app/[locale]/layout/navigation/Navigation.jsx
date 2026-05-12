"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Button from "../../components/buttons/Button";
import Motion from "../../components/motion/Motion";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#footer" },
];

const Navigation = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const currentUser = useSelector(selectCurrentUser);

  return (
    <nav className=" p-3 flex w-full items-center justify-between fixed top-0 z-50">
      <div className="flex items-center space-x-5">
        <LanguageSwitcher currentLocale={locale} />
        {/* <AnimLogo /> */}
      </div>
      <NavLinks />
      <LoginButtonSection locale={locale} currentUser={currentUser} />
    </nav>
  );
};

const NavLinks = () => {
  const handleClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="items-center gap-6 relative z-2 hidden md:flex">
      {NAV_LINKS.map(({ label, href }, index) => (
        <Motion animation="top" stagger delay={index * 0.2} key={href}>
          <a
            href={href}
            onClick={(e) => handleClick(e, href)}
            className="text-md text-cream/80 hover:text-cream duration-300 cursor-pointer"
          >
            {label}
          </a>
        </Motion>
      ))}
    </div>
  );
};

const AnimLogo = () => {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 150], [2, 1]);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -80,
        rotate: -25,
        scale: 0,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 2,
      }}
      transition={{
        delay: 1,
        duration: 1.2,
        type: "spring",
        stiffness: 180,
        damping: 10,
      }}
      style={{ scale }}
      className="origin-center "
    >
      <motion.div
        animate={{
          rotate: [0, 8, -8, 4, -4, 0],
        }}
        transition={{
          delay: 1.2,
          duration: 1.1,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/assets/doit-logo.JPG"
          alt="DoIt Logo"
          width={56}
          height={56}
          priority
        />
      </motion.div>
    </motion.div>
  );
};

const LoginButtonSection = ({ locale, currentUser }) => {
  return (
    <>
      {currentUser ? (
        <div className="relative z-2">
          <Link href={`/${locale}/${currentUser.display_name}`}>
            <Button variant="outline" text="My Profile" />
          </Link>
        </div>
      ) : (
        <div className="flex space-x-4 relative z-2">
          <Link href={`/${locale}/login`}>
            <Button text="login" />
          </Link>
          <Link href={`/${locale}/register`}>
            <Button text="register" variant="outline" />
          </Link>
        </div>
      )}
    </>
  );
};

const LanguageSwitcher = ({ currentLocale }) => {
  const otherLocale = currentLocale === "en" ? "es" : "en";
  return (
    <Link
      href={`/${otherLocale}`}
      className="text-sm text-cream/80 hover:text-cream duration-300"
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
};

export default Navigation;
