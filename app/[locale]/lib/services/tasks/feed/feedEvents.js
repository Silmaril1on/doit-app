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
    console.log(
      `[insertFeedEvent] ENTRY — eventType=${eventType} userId=${userId} payload=${JSON.stringify(payload)}`,
    );
    if (eventType === "friendship" && payload?.friend_id) {
      const friendId = String(payload.friend_id);
      const viewerId = String(userId);
      const [forward, reverse] = await Promise.all([
        supabaseAdmin
          .from("feed_events")
          .select("id")
          .eq("user_id", viewerId)
          .eq("event_type", "friendship")
          .eq("payload->>friend_id", friendId)
          .limit(1),
        supabaseAdmin
          .from("feed_events")
          .select("id")
          .eq("user_id", friendId)
          .eq("event_type", "friendship")
          .eq("payload->>friend_id", viewerId)
          .limit(1),
      ]);

      console.log(
        `[insertFeedEvent] Dedup check — forward=${JSON.stringify(forward.data)} reverse=${JSON.stringify(reverse.data)}`,
      );

      if (forward.error) throw new Error(forward.error.message);
      if (reverse.error) throw new Error(reverse.error.message);
      if (forward.data?.length || reverse.data?.length) {
        console.log(
          `[insertFeedEvent] SKIPPING — duplicate friendship pair detected`,
        );
        return;
      }
    }
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
    const { error: insertError } = await supabaseAdmin
      .from("feed_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        payload: normalizedPayload,
      });

    if (insertError) {
      if (
        insertError.code === "23505" ||
        insertError.message?.includes("feed_events_friendship_pair")
      ) {
        return;
      }
      throw new Error(insertError.message);
    }

    console.log(`[FeedEvent] Inserted OK: event_type=${eventType}`);
  } catch (err) {
    // Silent — feed events are non-critical
    console.error(
      `[FeedEvent] Insert failed for event_type=${eventType}:`,
      err,
    );
  }
}
