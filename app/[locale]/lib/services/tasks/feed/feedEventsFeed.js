"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function getFriendFeedEvents(
  friendIds,
  viewerId = null,
  { limit = 60 } = {},
) {
  if (!friendIds?.length) return [];

  const { data, error: byUserError } = await supabaseAdmin
    .from("feed_events")
    .select("id, user_id, event_type, payload, occurred_at")
    .in("user_id", friendIds)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (byUserError) throw new Error(byUserError.message);

  const events = data ?? [];

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

  // Enrich badge events with badge image/icon when missing
  const badgeEvents = dedupedEvents.filter(
    (e) => e.event_type === "badge" && e.payload?.category_id,
  );
  const badgeCategoryIds = Array.from(
    new Set(
      badgeEvents
        .map((e) => Number(e.payload?.category_id))
        .filter((id) => Number.isFinite(id)),
    ),
  );
  const badgeIconByKey = new Map();

  if (badgeCategoryIds.length > 0) {
    const { data: tierRows, error: tierError } = await supabaseAdmin
      .from("category_achievement_tiers")
      .select("category_id, level, icon")
      .in("category_id", badgeCategoryIds);

    if (tierError) throw new Error(tierError.message);

    for (const row of tierRows ?? []) {
      if (!row) continue;
      const key = `${row.category_id}:${row.level}`;
      badgeIconByKey.set(key, row.icon ?? null);
    }
  }

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

  return dedupedEvents.map((e) => {
    let payload = e.payload ?? null;

    if (e.event_type === "badge" && payload) {
      const categoryId = Number(payload.category_id);
      const level = Number(payload.badge_level);
      if (Number.isFinite(categoryId) && Number.isFinite(level)) {
        const key = `${categoryId}:${level}`;
        const badgeIcon = badgeIconByKey.get(key);
        if (badgeIcon && !payload.badge_image_url) {
          payload = { ...payload, badge_image_url: badgeIcon };
        }
      }
    }

    return {
      ...e,
      payload,
      _type: e.event_type,
      _sortTime: e.occurred_at,
      user: userMap[e.user_id] ?? null,
      ...(e.event_type === "friendship" && {
        friend: userMap[e.payload?.friend_id] ?? null,
      }),
    };
  });
}
