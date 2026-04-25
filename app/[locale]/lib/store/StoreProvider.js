"use client";
import { clearUser, setUser } from "@/app/[locale]/lib/features/userSlice";
import { setXp } from "@/app/[locale]/lib/features/xpSlice";
import { setColorValue } from "@/app/[locale]/lib/features/configSlice";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { useDispatch } from "react-redux";
import { makeStore } from "./store";

const getCookieValue = (name) => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const matchedCookie = cookies.find((entry) => entry.startsWith(`${name}=`));

  if (!matchedCookie) return null;

  return decodeURIComponent(matchedCookie.split("=").slice(1).join("="));
};

const StoreHydrator = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const serializedUser = getCookieValue("doit-user");

      if (!serializedUser) {
        dispatch(clearUser());
        return;
      }

      try {
        const cookieUser = JSON.parse(serializedUser);
        dispatch(setUser(cookieUser));

        // Pull latest profile + XP + user config in parallel.
        const [profileRes, xpRes, configRes] = await Promise.all([
          fetch("/api/user/profile/single-profile", { cache: "no-store" }),
          fetch("/api/user/xp", { cache: "no-store" }),
          fetch("/api/user/config", { cache: "no-store" }),
        ]);

        if (!isMounted) return;

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data?.profile) {
            dispatch(setUser({ ...cookieUser, ...data.profile }));
          }
        }

        if (xpRes.ok) {
          const xpData = await xpRes.json();
          if (xpData?.xp) dispatch(setXp(xpData.xp));
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData?.config?.color_value) {
            dispatch(setColorValue(configData.config.color_value));
          }
        }
      } catch {
        dispatch(clearUser());
      }
    };

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return children;
};

export const StoreProvider = ({ children, initialUser = null }) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = makeStore({
      user: { currentUser: initialUser },
    });
  }

  return (
    <Provider store={storeRef.current}>
      <StoreHydrator>{children}</StoreHydrator>
    </Provider>
  );
};
