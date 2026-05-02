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

  // Resolve accepted friends — single query, result shared with both sources below.
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

  // Fetch enough items from each source to correctly merge/sort the requested page.
  // fetchCap = offset + limit*3 ensures we always have enough candidate items.
  // Capped at 100 to prevent over-fetching on deep pagination.
  const fetchCap = Math.min(offset + limit * 3, 100);

  // Pass pre-resolved friendIds so feedTasks doesn't query friendships again.
  const [taskResult, events] = await Promise.all([
    getFriendsFeedTasks({ friendIds, limit: fetchCap }),
    getFriendFeedEvents(friendIds, userId, { limit: fetchCap }),
  ]);

  const taskItems = (taskResult.tasks ?? []).map((t) => ({
    ...t,
    _type: "task",
    _sortTime: t.created_at,
  }));

  const merged = [...taskItems, ...events].sort(
    (a, b) => new Date(b._sortTime) - new Date(a._sortTime),
  );

  const total = merged.length;
  const items = merged.slice(offset, offset + limit);

  return { items, total };
}
