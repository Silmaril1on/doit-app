"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function getFriendFeedEvents(friendIds, { limit = 100 } = {}) {
  if (!friendIds?.length) return [];

  const { data: events, error } = await supabaseAdmin
    .from("feed_events")
    .select("id, user_id, event_type, payload, occurred_at")
    .in("user_id", friendIds)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!events?.length) return [];

  // Collect all user IDs we need to enrich
  const actorIds = [...new Set(events.map((e) => e.user_id))];
  const friendUserIds = [
    ...new Set(
      events
        .filter((e) => e.event_type === "friendship" && e.payload?.friend_id)
        .map((e) => e.payload.friend_id),
    ),
  ];
  const allUserIds = [...new Set([...actorIds, ...friendUserIds])];

  const { data: users, error: uError } = await supabaseAdmin
    .from("users")
    .select("id, display_name, image_url")
    .in("id", allUserIds);

  if (uError) throw new Error(uError.message);

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

  return events.map((e) => ({
    ...e,
    _type: e.event_type,
    _sortTime: e.occurred_at,
    user: userMap[e.user_id] ?? null,
    ...(e.event_type === "friendship" && {
      friend: userMap[e.payload?.friend_id] ?? null,
    }),
  }));
}
