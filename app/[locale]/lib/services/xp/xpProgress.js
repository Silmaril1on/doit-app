"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import {
  PRIORITY_XP,
  TOKEN_REWARDS,
  resolveXpState,
} from "@/app/[locale]/lib/services/xp/xpConfig";
import { LEVEL_TIERS } from "@/app/[locale]/lib/local-bd/levelProgressData";
import { insertFeedEvent } from "@/app/[locale]/lib/services/tasks/feed/feedEvents";
import { createLevelBadgeNotification } from "@/app/[locale]/lib/services/notifications/notificationsTypes";

const XP_TABLE = "user_xp";

export async function grantTokens(userId, amount) {
  if (!userId || !amount || amount <= 0) return;

  const { data: userData, error: fetchError } = await supabaseAdmin
    .from("users")
    .select("token")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const current = userData?.token ?? 0;
  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ token: current + amount })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);
  console.log(
    `[Tokens] userId=${userId} | +${amount} → ${current + amount} total`,
  );
}

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
  // New users have no DB row yet — they start at level 1, not 0.
  // Using 0 as fallback would falsely trigger a level-up on first XP gain.
  const prevLevel = existing?.current_level ?? 1;
  const { total_xp, current_level } = resolveXpState(prevXp + xpGained);

  console.log(
    `[XP] userId=${userId} | priority=${normalized} | xpGained=${xpGained} | prevXp=${prevXp} prevLevel=${prevLevel} → total_xp=${total_xp} current_level=${current_level}`,
  );

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

  console.log(
    `[XP] Upsert OK → total_xp=${upserted.total_xp} current_level=${upserted.current_level}`,
  );

  // Fire a notification + feed event only when a named tier threshold is crossed
  if (current_level > prevLevel) {
    const newlyUnlocked = LEVEL_TIERS.filter(
      (t) => t.threshold > prevLevel && t.threshold <= current_level,
    );
    console.log(
      `[XP] Level-up detected: prevLevel=${prevLevel} → current_level=${current_level} | newlyUnlocked tiers:`,
      newlyUnlocked.map((t) => t.name),
    );

    for (const tier of newlyUnlocked) {
      // Send level badge notification — awaited so serverless env doesn't drop it
      if (displayName) {
        try {
          await createLevelBadgeNotification(
            userId,
            displayName,
            tier.name,
            tier.threshold,
          );
          console.log(
            `[XP] Level badge notification sent for tier=${tier.name} level=${tier.threshold}`,
          );
        } catch (notifErr) {
          console.error(
            `[XP] Failed to send level badge notification for tier=${tier.name}:`,
            notifErr,
          );
        }
      } else {
        console.warn(
          `[XP] Skipping notification — displayName is empty for userId=${userId}`,
        );
      }

      // One feed event per tier milestone reached (level 5, 10, 15, 20, 25, 30)
      try {
        await insertFeedEvent(userId, "levelup", {
          current_level: tier.threshold,
          total_xp,
          badge: tier.name.toLowerCase(),
        });
        console.log(
          `[XP] Feed event inserted for tier=${tier.name} level=${tier.threshold}`,
        );
      } catch (feedErr) {
        console.error(
          `[XP] Failed to insert feed event for tier=${tier.name}:`,
          feedErr,
        );
      }
    }

    // Grant 250 tokens per level gained
    try {
      const levelsGained = current_level - prevLevel;
      await grantTokens(userId, levelsGained * TOKEN_REWARDS.LEVEL_UP);
    } catch (tokenErr) {
      console.error(`[XP] Token grant failed for userId=${userId}:`, tokenErr);
    }
  }

  return {
    xpGained,
    total_xp: upserted.total_xp,
    current_level: upserted.current_level,
  };
}

export async function recordFixedXpGain(userId, amount) {
  if (!userId) throw new Error("userId is required");

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(XP_TABLE)
    .select("total_xp")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const prevXp = existing?.total_xp ?? 0;
  const { total_xp, current_level } = resolveXpState(prevXp + amount);

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

  return {
    xpGained: amount,
    total_xp: upserted.total_xp,
    current_level: upserted.current_level,
  };
}
