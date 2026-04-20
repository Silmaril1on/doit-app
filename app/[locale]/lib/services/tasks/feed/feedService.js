"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { getFriendsFeedTasks } from "./feedTasks";
import { getFriendFeedEvents } from "./feedEventsFeed";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function getUnifiedFriendsFeed({ offset = 0, limit = 20 } = {}) {
  const userId = await getCallerId();
  if (!userId) throw new Error("Unauthorized");

  // Resolve accepted friends (both sides of the friendship)
  const { data: friendships, error: fError } = await supabaseAdmin
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (fError) throw new Error(fError.message);
  if (!friendships?.length) return { items: [], total: 0 };

  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id,
  );

  // Fetch both sources in parallel — tasks use their own friend-resolution
  // internally but we pass a large cap so the merge is representative.
  const [taskResult, events] = await Promise.all([
    // Re-use existing service; fetch up to 200 to allow proper merge+sort.
    // We pass offset=0 and a large limit here; real pagination is done below.
    getFriendsFeedTasks({ offset: 0, limit: 200 }),
    getFriendFeedEvents(friendIds, userId, { limit: 200 }),
  ]);

  // Normalise tasks so they carry the same shape used by the renderer.
  const taskItems = (taskResult.tasks ?? []).map((t) => ({
    ...t,
    _type: "task",
    _sortTime: t.created_at,
  }));

  // Merge and sort descending by time
  const merged = [...taskItems, ...events].sort(
    (a, b) => new Date(b._sortTime) - new Date(a._sortTime),
  );

  const total = merged.length;
  const items = merged.slice(offset, offset + limit);

  return { items, total };
}
