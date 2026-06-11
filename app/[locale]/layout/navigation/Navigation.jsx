"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useSelector } from "react-redux";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import ReactCountryFlag from "react-country-flag";
import Button from "../../components/buttons/Button";
import Motion from "../../components/motion/Motion";
import BorderSvg from "../../components/elements/BorderSvg";

const LOCALE_META = {
  en: { countryCode: "GB", label: "English" },
  de: { countryCode: "DE", label: "Deutsch" },
  ka: { countryCode: "GE", label: "ქართული" },
};

const FLAG_STYLE = { width: "20px", height: "20px" };

const NavLinks = () => {
  const t = useTranslations("Navigation");

  const NAV_LINKS = [
    { key: "home", href: "#hero" },
    { key: "features", href: "#features" },
    { key: "faq", href: "#faq" },
    { key: "contactUs", href: "#footer" },
  ];

  const handleClick = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="items-center gap-6 relative z-2 hidden md:flex">
      {NAV_LINKS.map(({ key, href }, index) => (
        <Motion animation="top" stagger delay={index * 0.2} key={key}>
          <a
            href={href}
            onClick={(e) => handleClick(e, href)}
            className="text-md text-cream/80 hover:text-cream duration-300 cursor-pointer"
          >
            {t(key)}
          </a>
        </Motion>
      ))}
    </div>
  );
};

// ─── LanguageSwitcher ────────────────────────────────────────────────────────
const LanguageSwitcher = () => {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const locales = Object.keys(LOCALE_META);
  const current = LOCALE_META[locale] ?? LOCALE_META.en;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative ">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center cursor-pointer gap-1.5 p-1 rounded-md hover:bg-white/5 transition-colors duration-300"
        aria-label="Switch language"
      >
        <ReactCountryFlag
          countryCode={current.countryCode}
          svg
          style={FLAG_STYLE}
          title={current.label}
        />
        <svg
          className={`w-3 h-3 text-cream/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute left-0 top-full mt-2 w-36 rounded-lg border border-white/10 bg-[#111] shadow-xl overflow-hidden z-50"
        >
          <BorderSvg />
          {locales.map((loc) => {
            const meta = LOCALE_META[loc];
            const isActive = loc === locale;
            return (
              <li key={loc}>
                <Link
                  href="/"
                  locale={loc}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150 ${
                    isActive
                      ? "text-primary bg-white/5 font-medium"
                      : "text-cream/70 hover:text-cream hover:bg-white/5"
                  }`}
                >
                  <ReactCountryFlag
                    countryCode={meta.countryCode}
                    svg
                    style={{ width: "16px", height: "16px" }}
                    title={meta.label}
                  />
                  {meta.label}
                </Link>
              </li>
            );
          })}
        </motion.ul>
      )}
    </div>
  );
};

// ─── LoginButtonSection ──────────────────────────────────────────────────────
const LoginButtonSection = ({ currentUser }) => {
  const t = useTranslations("Navigation");
  const router = useRouter();

  return (
    <>
      {currentUser ? (
        <div className="relative z-2">
          <Button
            variant="outline"
            text={t("myProfile")}
            onClick={() => router.push(`/${currentUser.display_name}`)}
          />
        </div>
      ) : (
        <div className="flex space-x-4 relative z-2 z-50">
          <Button text={t("login")} onClick={() => router.push("/login")} />
          <Button
            text={t("register")}
            variant="outline"
            onClick={() => router.push("/register")}
          />
        </div>
      )}
    </>
  );
};

// ─── Navigation (root) ──────────────────────────────────────────────────────
const Navigation = () => {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <nav className="p-3 flex w-full items-center justify-between fixed top-0 z-50">
      <div className="flex items-center space-x-2">
        {/* <AnimLogo /> */}
        <LanguageSwitcher />
      </div>
      <NavLinks />
      <LoginButtonSection currentUser={currentUser} />
    </nav>
  );
};

// ─── AnimLogo (kept for reference / future use) ──────────────────────────────
const AnimLogo = () => {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 150], [2, 1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -80, rotate: -25, scale: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 2, x: -10 }}
      transition={{
        delay: 1,
        duration: 1.2,
        type: "spring",
        stiffness: 180,
        damping: 10,
      }}
      style={{ scale }}
      className="origin-center sepia hidden lg:block"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 4, -4, 0] }}
        transition={{ delay: 1.2, duration: 1.1, ease: "easeInOut" }}
      >
        <Image
          src="/web-logo.png"
          alt="DoIt Logo"
          width={56}
          height={56}
          priority
        />
      </motion.div>
    </motion.div>
  );
};

export default Navigation;
