"use client";

import { FcGoogle } from "react-icons/fc";
import { supabaseClient } from "@/app/[locale]/lib/supabase/supabaseClient";
import { useState } from "react";
import { useParams } from "next/navigation";

const GoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsLoading(false);
    }
    // on success the browser is redirected by Supabase — no cleanup needed
  };

  return (
    <div className="space-y-2 w-fit mx-auto">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-sm border border-teal-500/25 bg-white/5 px-4 py-2 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FcGoogle size={20} />
        {isLoading ? "Redirecting…" : "Sign in with Google"}
      </button>

      {error && <p className="text-center text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default GoogleAuth;
