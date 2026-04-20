"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function getFriendFeedEvents(
  friendIds,
  viewerId = null,
  { limit = 100 } = {},
) {
  if (!friendIds?.length) return [];

  const [byUser, byFriend] = await Promise.all([
    supabaseAdmin
      .from("feed_events")
      .select("id, user_id, event_type, payload, occurred_at")
      .in("user_id", friendIds)
      .order("occurred_at", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("feed_events")
      .select("id, user_id, event_type, payload, occurred_at")
      .in("payload->>friend_id", friendIds)
      .order("occurred_at", { ascending: false })
      .limit(limit),
  ]);

  if (byUser.error) throw new Error(byUser.error.message);
  if (byFriend.error) throw new Error(byFriend.error.message);

  const mergedEvents = [...(byUser.data ?? []), ...(byFriend.data ?? [])];
  if (!mergedEvents.length) return [];

  const byId = new Map(mergedEvents.map((e) => [e.id, e]));
  const events = [...byId.values()];

  const viewerFiltered = viewerId
    ? events.filter(
        (e) => e.user_id !== viewerId && e.payload?.friend_id !== viewerId,
      )
    : events;

  const seenFriendships = new Set();
  const dedupedEvents = viewerFiltered.filter((e) => {
    if (e.event_type !== "friendship") return true;
    const friendId = e.payload?.friend_id ?? "";
    const key = `${e.user_id}:${friendId}`;
    if (seenFriendships.has(key)) return false;
    seenFriendships.add(key);
    return true;
  });

  // Collect all user IDs we need to enrich
  const actorIds = [...new Set(dedupedEvents.map((e) => e.user_id))];
  const friendUserIds = [
    ...new Set(
      dedupedEvents
        .filter((e) => e.event_type === "friendship" && e.payload?.friend_id)
        .map((e) => e.payload.friend_id),
    ),
  ];
  const allUserIds = [...new Set([...actorIds, ...friendUserIds])];

  const { data: users, error: uError } = await supabaseAdmin
    .from("users")
    .select("id, display_name, first_name, last_name, image_url")
    .in("id", allUserIds);

  if (uError) throw new Error(uError.message);

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

  return dedupedEvents.map((e) => ({
    ...e,
    _type: e.event_type,
    _sortTime: e.occurred_at,
    user: userMap[e.user_id] ?? null,
    ...(e.event_type === "friendship" && {
      friend: userMap[e.payload?.friend_id] ?? null,
    }),
  }));
}
