"use client";

import React, { useEffect, useState } from "react";
import { CountryFlags } from "../../components/elements/CountryFlags";
import { FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Motion from "../../components/motion/Motion";

const STORAGE_KEY = "user-location-cache";

const Footer = () => {
  // Initialize from localStorage immediately
  const [location, setLocation] = useState(() => {
    if (typeof window === "undefined") {
      return {
        country: null,
        city: null,
      };
    }

    try {
      const cached = localStorage.getItem("user-location-cache");

      if (!cached) {
        return {
          country: null,
          city: null,
        };
      }

      const parsed = JSON.parse(cached);

      // expire after 24h
      const isExpired = Date.now() - parsed.timestamp > 1000 * 60 * 60 * 24;

      if (isExpired) {
        localStorage.removeItem("user-location-cache");

        return {
          country: null,
          city: null,
        };
      }

      return {
        country: parsed.country,
        city: parsed.city,
      };
    } catch {
      return {
        country: null,
        city: null,
      };
    }
  });

  useEffect(() => {
    // already cached
    if (location.country) return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
          );

          const data = await res.json();

          const newLocation = {
            country: data.countryName || null,
            city: data.city || data.locality || null,
          };

          setLocation(newLocation);

          localStorage.setItem(
            "user-location-cache",
            JSON.stringify({
              ...newLocation,
              timestamp: Date.now(),
            }),
          );
        } catch (err) {
          console.error(err);
        }
      },
      () => {},
      {
        enableHighAccuracy: false,
        timeout: 6000,
      },
    );
  }, [location.country]);

  return (
    <footer
      id="footer"
      className="relative bg-stone-800 backdrop-blur-md w-full h-screen flex items-end"
    >
      <div className="w-full bg-black relative px-[5%] py-10 flex flex-col md:flex-row items-center lg:items-start justify-between gap-8">
        <div className="w-full absolute left-0 -top-40 lg:-top-75">
          <Image
            width={1000}
            height={400}
            src="/foter-1.png"
            alt="Footer Background"
            className="w-full transparent h-78 object-[center_22%] object-cover drop-shadow-[2px_2px_15px_rgba(0,0,0,0.5)]"
          />
        </div>

        <Motion animation="left" className="flex flex-col items-center gap-2">
          <span className="primary text-3xl text-primary">DoIt</span>

          <div className="items-center lg:items-start flex flex-col">
            <h1 className="text-cream/90 text-xs mb-1">follow us on</h1>

            <a
              href="https://instagram.com/doit.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DoIt on Instagram"
              className="flex items-center gap-2 text-primary/90 hover:text-primary duration-300"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </Motion>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-x-8">
          {[
            ["Terms & Conditions", "/terms"],
            ["Privacy Policy", "/privacy"],
            ["Contact Us", "/contact"],
            ["Help Center", "/help"],
          ].map(([label, href], index) => (
            <Motion animation="fade" delay={index * 0.2} key={label}>
              <a
                href={href}
                className="text-xl text-cream hover:text-primary transition-colors duration-300"
              >
                {label}
              </a>
            </Motion>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-end">
          <p className="secondary text-[10px] uppercase tracking-widest text-cream/50 leading-none">
            Your location
          </p>

          {location.country ? (
            <CountryFlags
              title={true}
              size="sm"
              countryName={location.country}
              cityName={location.city}
            />
          ) : (
            <span className="secondary text-xs text-cream/25">Detecting…</span>
          )}

          <p className="secondary text-[10px] text-chino mt-3">
            © {new Date().getFullYear()} DoIt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
