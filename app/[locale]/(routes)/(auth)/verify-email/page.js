"use client";

import Logo from "@/app/[locale]/components/elements/Logo";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { supabaseClient } from "@/app/[locale]/lib/supabase/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const VerifyEmailCallbackPage = () => {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const dispatch = useDispatch();
  const router = useRouter();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verify = async () => {
      try {
        let token = null;

        // 1. Hash-based implicit flow: #access_token=...
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || "";

        if (accessToken) {
          const { data, error } = await supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error && data.session) {
            token = data.session.access_token;
          }
        }

        // 2. PKCE flow: ?code=...
        if (!token) {
          const code = new URLSearchParams(window.location.search).get("code");
          if (code) {
            const { data, error } =
              await supabaseClient.auth.exchangeCodeForSession(code);
            if (!error && data.session) {
              token = data.session.access_token;
            }
          }
        }

        // 3. Existing active session
        if (!token) {
          const { data } = await supabaseClient.auth.getSession();
          token = data?.session?.access_token ?? null;
        }

        if (!token) {
          setStatus("error");
          return;
        }

        const res = await fetch("/api/auth/verify-email", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Verification failed.");
        }

        setStatus("success");
        dispatch(
          setToast({ type: "success", msg: "Email verified successfully!" }),
        );
        setTimeout(() => router.replace(`/${locale}`), 1500);
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [dispatch, locale, router]);

  return (
    <main className="min-h-screen bg-black px-4 center flex-col space-y-6">
      <Logo size="large" />

      {status === "verifying" && (
        <p className="secondary text-sm text-white/40 uppercase tracking-widest">
          Verifying your email...
        </p>
      )}

      {status === "success" && (
        <p className="secondary text-sm text-teal-400 uppercase tracking-widest">
          Email verified! Redirecting...
        </p>
      )}

      {status === "error" && (
        <div className="text-center space-y-3">
          <p className="secondary text-sm text-red-400 uppercase tracking-widest">
            Verification failed or link expired.
          </p>
          <a
            href={`/${locale}/profile/security`}
            className="secondary text-xs text-white/40 hover:text-teal-400 transition-colors duration-200 uppercase tracking-widest"
          >
            Request a new verification link
          </a>
        </div>
      )}
    </main>
  );
};

export default VerifyEmailCallbackPage;
