"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import {
  PRIORITY_XP,
  resolveXpState,
} from "@/app/[locale]/lib/services/xp/xpConfig";
import { LEVEL_TIERS } from "@/app/[locale]/lib/local-bd/levelProgressData";
import { createLevelBadgeNotification } from "@/app/[locale]/lib/services/notifications/notificationsTypes";

const XP_TABLE = "user_xp";

export async function getUserXp(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from(XP_TABLE)
    .select("total_xp, current_level")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  // Row doesn't exist yet — user has no XP recorded
  if (!data) return { total_xp: 0, current_level: 1 };
  return data;
}

export async function recordXpGain(userId, priority, displayName) {
  if (!userId) throw new Error("userId is required");

  const normalized = String(priority ?? "low").toLowerCase();
  const xpGained = PRIORITY_XP[normalized] ?? PRIORITY_XP.low;

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(XP_TABLE)
    .select("total_xp, current_level")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const prevXp = existing?.total_xp ?? 0;
  const prevLevel = existing?.current_level ?? 0;
  const { total_xp, current_level } = resolveXpState(prevXp + xpGained);

  const { data: upserted, error: upsertError } = await supabaseAdmin
    .from(XP_TABLE)
    .upsert(
      {
        user_id: userId,
        total_xp,
        current_level,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("total_xp, current_level")
    .single();

  if (upsertError) throw new Error(upsertError.message);

  // Fire a notification for every level badge threshold crossed in this gain
  if (displayName && current_level > prevLevel) {
    const newlyUnlocked = LEVEL_TIERS.filter(
      (t) => t.threshold > prevLevel && t.threshold <= current_level,
    );
    for (const tier of newlyUnlocked) {
      createLevelBadgeNotification(
        userId,
        displayName,
        tier.name,
        tier.threshold,
      ).catch(() => {});
    }
  }

  return {
    xpGained,
    total_xp: upserted.total_xp,
    current_level: upserted.current_level,
  };
}
