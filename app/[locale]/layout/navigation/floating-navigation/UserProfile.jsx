"use client";

import Button from "@/app/[locale]/components/buttons/Button";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import ArrowUpDown from "@/app/[locale]/components/elements/ArrowUpDown";
import React, { useEffect, useRef, useState } from "react";
import {
  clearUser,
  selectCurrentUser,
} from "@/app/[locale]/lib/features/userSlice";
import { clearColorValue } from "@/app/[locale]/lib/features/configSlice";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getUserInitials } from "@/app/[locale]/lib/utils/utils";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import Motion from "../../../components/motion/Motion";
import { useModalActions } from "@/app/[locale]/lib/hooks/useModal";
import { ACCOUNT_VERIFICATION_MODAL } from "@/app/[locale]/components/modals/AccountVerificationModal";
import { SHOW_MY_ID_MODAL } from "@/app/[locale]/components/modals/ShowMyIdModal";
import { resetHydration } from "@/app/[locale]/lib/store/StoreProvider";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const { open } = useModalActions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [emailVerified, setEmailVerified] = useState(null);
  const menuRef = useRef(null);
  const emailFetched = useRef(false);
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

  // Fetch email verification status once per session — guard prevents re-fires
  // when Redux dispatches update the user object mid-session.
  useEffect(() => {
    if (!user?.id || emailFetched.current) return;
    emailFetched.current = true;
    fetch("/api/auth/verify-email")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setEmailVerified(d.email_verified ?? false);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsMenuOpen(false);
      // Allow StoreHydrator to re-run on next login without a full page reload
      resetHydration();
      emailFetched.current = false;
      dispatch(clearUser());
      dispatch(clearColorValue());
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
            sizes="32px"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full center bg-primary text-lg font-bold uppercase text-black">
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
  const menuLinks = [
    {
      type: "button",
      label: "Show My ID",
      onClick: () => {
        setIsMenuOpen(false);
        open(SHOW_MY_ID_MODAL);
      },
    },
    {
      type: "link",
      label: "Badges",
      href: `/${locale}/game-settings/achievements`,
      onClick: () => setIsMenuOpen(false),
    },
    {
      type: "link",
      label: "Game Settings",
      href: `/${locale}/game-settings`,
      onClick: () => setIsMenuOpen(false),
    },
    {
      type: "link",
      label: "My Profile",
      href: `/${locale}/${user?.display_name}`,
      onClick: () => setIsMenuOpen(false),
    },
  ];

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <Motion
          animation="right"
          className="absolute bottom-[calc(100%+15px)] -right-3 z-30 min-w-40 backdrop-blur-2xl overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 backdro-blur-lg"
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
                  className="secondary cursor-pointer text-[10px] uppercase tracking-widest text-primary/80 hover:text-primary transition-colors duration-200 text-left"
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
                  className="secondary cursor-pointer text-[10px] uppercase tracking-widest text-primary/80 hover:text-primary duration-300"
                >
                  Account Verified
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 *:duration-300 *:w-fit">
              {menuLinks.map((item) =>
                item.type === "link" ? (
                  <Link
                    key={item.label}
                    className="text-primary/80 hover:text-primary leading-none"
                    href={item.href}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="text-primary/80 hover:text-primary leading-none text-left cursor-pointer"
                  >
                    {item.label}
                  </button>
                ),
              )}
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
