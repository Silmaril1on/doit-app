"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const LEVEL_BADGE_BY_LEVEL = {
  5: "bronze",
  10: "silver",
  15: "gold",
  20: "platinum",
  25: "diamond",
  30: "legend",
};

export async function insertFeedEvent(userId, eventType, payload) {
  try {
    let normalizedPayload = payload;
    if (eventType === "levelup") {
      const rawLevel = payload?.current_level ?? payload?.new_level;
      const level = Number(rawLevel);
      const totalXp = Number(payload?.total_xp);
      const badge = LEVEL_BADGE_BY_LEVEL[level] ?? null;

      console.log(
        `[FeedEvent] levelup check: level=${level} totalXp=${totalXp} badge=${badge}`,
      );

      // Only store tier milestones with complete payload (5,10,15,20,25,30)
      if (!badge) {
        console.warn(
          `[FeedEvent] Skipping non-milestone level=${level} — not inserting feed event`,
        );
        return;
      }
      if (!Number.isFinite(level) || !Number.isFinite(totalXp)) {
        console.warn(
          `[FeedEvent] Skipping levelup — invalid level or totalXp`,
          { level, totalXp },
        );
        return;
      }

      normalizedPayload = {
        total_xp: totalXp,
        current_level: level,
        badge,
      };
    }

    console.log(
      `[FeedEvent] Inserting event_type=${eventType} for userId=${userId}`,
      normalizedPayload,
    );
    await supabaseAdmin.from("feed_events").insert({
      user_id: userId,
      event_type: eventType,
      payload: normalizedPayload,
    });
    console.log(`[FeedEvent] Inserted OK: event_type=${eventType}`);
  } catch (err) {
    // Silent — feed events are non-critical
    console.error(
      `[FeedEvent] Insert failed for event_type=${eventType}:`,
      err,
    );
  }
}
