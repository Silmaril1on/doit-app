"use client";

import Button from "@/app/[locale]/components/buttons/Button";
import React, { useEffect, useRef, useState } from "react";
import {
  clearUser,
  selectCurrentUser,
} from "@/app/[locale]/lib/features/userSlice";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { MdArrowDropUp, MdOutlineArrowDropDown } from "react-icons/md";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-2 ">
      <div
        className="center cursor-pointer"
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <button
          type="button"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-teal-500 text-sm font-bold uppercase text-black "
          aria-expanded={isMenuOpen}
        >
          {String(user.display_name || user.email || "U").slice(0, 1)}
        </button>
        {isMenuOpen ? (
          <MdArrowDropUp size={20} className="text-white" />
        ) : (
          <MdOutlineArrowDropDown size={20} className="text-white" />
        )}
      </div>

      {isMenuOpen ? (
        <div className="absolute right-0 overflow-hidden -top-42 z-30 min-w-40 rounded-lg border border-teal-500/20 bg-teal-400/10 p-3">
          <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-400 blur-[80px]" />
          <div className="mb-3 border-b border-teal-500/15 pb-3">
            <p className="secondary text-sm font-semibold text-white">
              {user.display_name}
            </p>
            <p className="secondary text-xs text-chino/70">{user.email}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              text="My Profile"
              href={`/${locale}/profile`}
              className="w-full"
            />
            <Button
              text="Logout"
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserProfile;
