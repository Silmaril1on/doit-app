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
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { ACCOUNT_VERIFICATION_MODAL } from "@/app/[locale]/components/modals/AccountVerificationModal";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const { open } = useModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [emailVerified, setEmailVerified] = useState(null);
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

  useEffect(() => {
    if (!user) return;
    fetch("/api/auth/verify-email")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setEmailVerified(d.email_verified ?? false);
      })
      .catch(() => {});
  }, [user]);

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
      <ProfileIcon
        user={user}
        fallbackText={fallbackText}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      <ProfileBody
        user={user}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        emailVerified={emailVerified}
        handleLogout={handleLogout}
        open={open}
        locale={locale}
      />
    </div>
  );
};

const ProfileIcon = ({ user, fallbackText, isMenuOpen, setIsMenuOpen }) => {
  return (
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
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full center bg-teal-500 text-lg font-bold uppercase text-black">
            {fallbackText}
          </span>
        )}
      </button>
      <ArrowUpDown isOpen={isMenuOpen} size={20} className="text-white" />
    </div>
  );
};

const ProfileBody = ({
  user,
  isMenuOpen,
  setIsMenuOpen,
  emailVerified,
  handleLogout,
  locale,
  open,
}) => {
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <Motion
          animation="right"
          className="absolute bottom-[calc(100%+15px)] -right-3 z-30 min-w-40 backdrop-blur-2xl overflow-hidden rounded-2xl border border-teal-500/20 bg-teal-500/10 backdro-blur-lg"
        >
          <div className=" p-2">
            <div className="mb-3 pb-1 border-b border-teal-500/15">
              <p className="secondary text-md font-semibold text-cream capitalize leading-none">
                {user.display_name}
              </p>
              <p className="secondary text-[10px] text-chino/70">
                {user.email}
              </p>
              {emailVerified === false && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    open(ACCOUNT_VERIFICATION_MODAL);
                  }}
                  className="secondary cursor-pointer text-[10px] uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors duration-200 text-left"
                >
                  Verify Account?
                </button>
              )}
              {emailVerified === true && (
                <p
                  onClick={() => {
                    setIsMenuOpen(false);
                    open(ACCOUNT_VERIFICATION_MODAL);
                  }}
                  className="secondary cursor-pointer text-[10px] uppercase tracking-widest text-teal-500/70 hover:text-teal-500 duration-300"
                >
                  Account Verified
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 *:duration-300 *:w-fit">
              <Link
                className="text-teal-500 hover:text-teal-300 leading-none"
                href={`/${locale}/game-settings/achievements`}
              >
                Badges
              </Link>
              <Link
                className="text-teal-500 hover:text-teal-300 leading-none"
                href={`/${locale}/game-settings`}
                onClick={() => setIsMenuOpen(false)}
              >
                Game Settings
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
  );
};

export default UserProfile;
