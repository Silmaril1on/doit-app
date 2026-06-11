"use client";
import React, { useState } from "react";
import Link from "next/link";
import { MdOutlineUpdate } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa6";

// ─── FAQ accordion item ───────────────────────────────────────────────────────
const FaqItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const separatorIndex = item.indexOf(" — ");
  const question = separatorIndex !== -1 ? item.slice(0, separatorIndex) : item;
  const answer = separatorIndex !== -1 ? item.slice(separatorIndex + 3) : "";

  return (
    <div className="border-b border-primary/10 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 text-cream/80 hover:text-primary"
      >
        <span className="text-sm font-bold leading-snug transition-colors duration-200">
          {question}
        </span>
        <FaChevronDown
          className={`text-primary/50 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-primary" : "hover:text-primary/80"
          }`}
        />
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 300ms ease",
        }}
      >
        <div className="overflow-hidden">
          <p className="text-cream/50 text-sm pb-4 leading-relaxed secondary">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Cross-link bar ───────────────────────────────────────────────────────────
const ALL_LINKS = [
  {
    href: "/support/terms-and-conditions",
    label: "Terms & Conditions",
    key: "general",
  },
  { href: "/support/privacy-policy", label: "Privacy Policy", key: "privacy" },
  { href: "/support/help-center", label: "Help Center", key: "helpCenter" },
  { href: "/support/faq", label: "FAQ", key: "faq" },
  { href: "/support/cookies", label: "Cookies", key: "cookies" },
  { href: "/support/about", label: "About Us", key: "about" },
];

// ─── Main component ───────────────────────────────────────────────────────────
const SupportPageComponent = ({ type, data }) => {
  const [activeSection, setActiveSection] = useState(null);

  if (!data) return null;

  const scrollTo = (index) => {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(index);
    }
  };

  const crossLinks = ALL_LINKS.filter((l) => l.key !== type);

  return (
    <main className="min-h-screen bg-stone-950 text-cream">
      {/* Hero */}
      <div className="relative overflow-hidden bg-black border-b border-primary/20">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 lg:py-20">
          <p className="text-primary text-xs secondary px-3 py-1 rounded-full border border-primary/30 bg-primary/10 w-fit uppercase tracking-[0.35em] mb-4">
            DoIt · Support
          </p>
          <h1 className="text-cream text-3xl lg:text-5xl font-bold uppercase tracking-tight leading-tight">
            {data.title}
          </h1>
          <div className="flex text-cream/40 items-center gap-2 mt-2">
            <MdOutlineUpdate />
            <p className="text-[10px] secondary">
              Last Updated: {data.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-12">
        {/* Table of Contents */}
        <div className="bg-stone-900 border border-primary/15 p-5 lg:p-6">
          <p className="text-primary/60 text-xs uppercase font-bold tracking-[0.3em] mb-4">
            Contents
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {data.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`flex items-center gap-3 text-left group transition-colors duration-200 py-0.5 ${
                  activeSection === index
                    ? "text-primary"
                    : "text-cream/40 hover:text-cream"
                }`}
              >
                <span className="font-mono text-xs text-primary/30 group-hover:text-primary/60 transition-colors shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-snug secondary">
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {data.sections.map((section, index) => (
            <div key={index} id={`section-${index}`} className="scroll-mt-8">
              <div className="flex items-baseline gap-4 mb-5 pb-3 border-b border-primary/15">
                <span className="font-mono text-sm text-primary/50 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-cream text-xl lg:text-2xl font-bold uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>

              {type === "faq" ? (
                <div>
                  {section.items.map((item, itemIndex) => (
                    <FaqItem key={itemIndex} item={item} />
                  ))}
                </div>
              ) : (
                <ul className="space-y-3 pl-2">
                  {section.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex gap-3 text-cream/50 text-sm lg:text-base leading-relaxed"
                    >
                      <span className="text-primary/40 mt-1.5 shrink-0 text-xs">
                        ▸
                      </span>
                      <span className="secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-8 border-t border-primary/20 space-y-2">
          <p className="text-cream font-semibold text-sm leading-relaxed">
            {data.footer.note}
          </p>
          <p className="text-cream/40 text-sm secondary leading-none">
            {data.footer.contact}
          </p>
          <p className="text-cream/30 secondary text-xs italic">
            {data.footer.version}
          </p>
        </div>

        {/* Cross-links */}
        <div className="flex gap-x-4 gap-y-2 flex-wrap items-center">
          <span className="text-stone-600 text-[10px] uppercase tracking-widest">
            See also:
          </span>
          {crossLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-primary/50 hover:text-primary text-xs uppercase tracking-widest duration-200 border-b border-primary/15 hover:border-primary/50 pb-0.5"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SupportPageComponent;
