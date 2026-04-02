"use client";
import { clearUser, setUser } from "@/app/[locale]/lib/features/userSlice";
import { setXp } from "@/app/[locale]/lib/features/xpSlice";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { useDispatch } from "react-redux";
import { store } from "./store";

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

        // Pull latest profile + XP in parallel.
        const [profileRes, xpRes] = await Promise.all([
          fetch("/api/user/profile/single-profile", { cache: "no-store" }),
          fetch("/api/user/xp", { cache: "no-store" }),
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

export const StoreProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <StoreHydrator>{children}</StoreHydrator>
    </Provider>
  );
};
