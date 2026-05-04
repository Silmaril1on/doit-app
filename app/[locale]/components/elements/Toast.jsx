"use client";

import {
  clearToast,
  selectToast,
} from "@/app/[locale]/lib/features/toastSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const ERROR_STYLE = {
  wrapper: "border-crimson/50 bg-crimson/15 text-red-100",
  dot: "bg-red-300",
  title: "Error",
};

const LoadingSpinner = () => (
  <svg
    className="h-3.5 w-3.5 animate-spin text-amber-400"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const Toast = () => {
  const dispatch = useDispatch();
  const { isVisible, msg, type } = useSelector(selectToast);

  const styleByType = {
    success: {
      wrapper: "border-primary/45 bg-primary/15 text-cream/80",
      dot: "bg-primary",
      title: "Success",
    },
    loading: {
      wrapper: "border-amber-500/40 bg-amber-500/10 text-amber-100",
      dot: null, // replaced by spinner
      title: "Please wait",
    },
    error: ERROR_STYLE,
  };

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(clearToast());
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, isVisible, msg]);

  if (!isVisible || !msg) {
    return null;
  }

  const variant = styleByType[type] || styleByType.error;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-100 w-[calc(100%-2rem)] max-w-sm">
      <div
        role="alert"
        aria-live="polite"
        className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${variant.wrapper}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-2 inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center ${variant.dot ? "" : ""}`}
          >
            {variant.dot ? (
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${variant.dot}`}
              />
            ) : (
              <LoadingSpinner />
            )}
          </span>
          <div className="min-w-0 grow">
            <p className="primary text-xs uppercase tracking-[0.18em]">
              {variant.title}
            </p>
            <p className="secondary mt-1 wrap-break-word text-sm">{msg}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearToast())}
            className="secondary rounded-md px-2 py-1 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
