"use client";
import { useEffect, useRef, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { makeStore } from "./store";
import { clearUser, setUser } from "@/app/[locale]/lib/features/userSlice";
import { setXp } from "@/app/[locale]/lib/features/xpSlice";
import {
  setColorValue,
  clearColorValue,
} from "@/app/[locale]/lib/features/configSlice";

// --- utils ---
const getCookieValue = (name) => {
  if (typeof document === "undefined") return null;

  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));

  return entry ? decodeURIComponent(entry.split("=").slice(1).join("=")) : null;
};

// --- hydrator ---
const StoreHydrator = ({ children }) => {
  const dispatch = useDispatch();
  const hydrationDone = useRef(false);

  useEffect(() => {
    if (hydrationDone.current) return;
    hydrationDone.current = true;

    const controller = new AbortController();

    const hydrate = async () => {
      const serializedUser = getCookieValue("doit-user");

      if (!serializedUser) {
        dispatch(clearUser());
        dispatch(clearColorValue());
        return;
      }

      try {
        const user = JSON.parse(serializedUser);
        dispatch(setUser(user));
      } catch {
        dispatch(clearUser());
        return;
      }

      try {
        const [xpRes, configRes] = await Promise.all([
          fetch("/api/user/xp", { signal: controller.signal }),
          fetch("/api/user/config", { signal: controller.signal }),
        ]);

        if (xpRes.ok) {
          const xpData = await xpRes.json();
          if (xpData?.xp) dispatch(setXp(xpData.xp));
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData?.config?.color_value) {
            dispatch(setColorValue(configData.config.color_value));
          } else {
            dispatch(clearColorValue());
          }
        }
      } catch {
        // silently ignore (network / abort / etc.)
      }
    };

    hydrate();

    return () => controller.abort();
  }, [dispatch]);

  return children;
};

// --- provider ---
export const StoreProvider = ({ children, initialUser = null }) => {
  const [store] = useState(() =>
    makeStore({
      user: { currentUser: initialUser },
    }),
  );

  return (
    <Provider store={store}>
      <StoreHydrator>{children}</StoreHydrator>
    </Provider>
  );
};
