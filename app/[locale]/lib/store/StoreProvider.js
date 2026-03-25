"use client";
import { clearUser, setUser } from "@/app/[locale]/lib/features/userSlice";
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
    const serializedUser = getCookieValue("doit-user");

    if (!serializedUser) {
      dispatch(clearUser());
      return;
    }

    try {
      dispatch(setUser(JSON.parse(serializedUser)));
    } catch {
      dispatch(clearUser());
    }
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
