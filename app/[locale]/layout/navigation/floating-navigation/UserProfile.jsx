"use client";

import Button from "@/app/[locale]/components/buttons/Button";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import ArrowUpDown from "@/app/[locale]/components/elements/ArrowUpDown";
import React, { useEffect, useRef, useState } from "react";
import {
  clearUser,
  selectCurrentUser,
} from "@/app/[locale]/lib/features/userSlice";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getUserInitials } from "@/app/[locale]/lib/utils/utils";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import Motion from "../../../components/motion/Motion";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setIsMenuOpen(false);
      dispatch(clearUser());
      router.push(`/${locale}/`);
    }
  };

  if (!user) {
    return null;
  }

  const fallbackText = getUserInitials(user);

  return (
    <div ref={menuRef} className="relative flex items-center gap-2 ">
      <div
        className="center cursor-pointer"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <button
          type="button"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full overflow-hidden"
          aria-expanded={isMenuOpen}
        >
          {user.image_url ? (
            <ImageTag
              src={user.image_url}
              alt="User avatar"
              width={32}
              height={32}
              containerClassName="w-full h-full"
              imageClassName="w-full h-full"
            />
          ) : (
            <span className=" bg-teal-500 text-sm font-bold uppercase text-black">
              {fallbackText}
            </span>
          )}
        </button>
        <ArrowUpDown isOpen={isMenuOpen} size={20} className="text-white" />
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <Motion
            animation="right"
            className="absolute bottom-[calc(100%+15px)] -right-3 z-30 min-w-40 backdrop-blur-2xl overflow-hidden rounded-2xl border border-teal-500/20 bg-black/80"
          >
            <div className=" p-2">
              <div className="mb-3 border-b border-teal-500/15 pb-3">
                <p className="secondary text-sm font-semibold text-white">
                  {user.display_name}
                </p>
                <p className="secondary text-xs text-chino/70">{user.email}</p>
              </div>

              <div className="flex flex-col gap-2  duration-300 *:w-fit">
                <Link
                  className="text-teal-500 hover:text-teal-300"
                  href={`/${locale}/profile/basic-information`}
                >
                  My Profile
                </Link>
                <Link
                  className="text-teal-500 hover:text-teal-300"
                  href={`/${locale}/profile/my-achievements`}
                >
                  Badges
                </Link>
                <Button
                  text="Logout"
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                />
              </div>
            </div>
          </Motion>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
