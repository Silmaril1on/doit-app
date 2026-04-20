"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function sendFriendRequest(addresseeId) {
  const requesterId = await getCallerId();

  if (!requesterId)
    throw new Error("You must be logged in to send a friend request");
  if (requesterId === addresseeId)
    throw new Error("Cannot send a friend request to yourself");

  const { data, error } = await supabaseAdmin
    .from("friendships")
    .insert({ requester_id: requesterId, addressee_id: addresseeId })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Notify the addressee — fire and forget, never break main flow
  try {
    const { data: requester } = await supabaseAdmin
      .from("users")
      .select("display_name, first_name")
      .eq("id", requesterId)
      .single();

    const name = requester?.display_name ?? requester?.first_name ?? "Someone";

    await supabaseAdmin.from("notifications").insert({
      user_id: addresseeId,
      status: "Friend Request",
      message: `${name} wants to be your friend on DoIt! Head to your Friendship page to accept or decline.`,
      priority: "medium",
      display_name: name,
      has_read: false,
    });
  } catch {
    // Notification failure must never block the friend request
  }

  return data;
}

export async function getPendingFriendRequests() {
  const userId = await getCallerId();
  if (!userId) throw new Error("Unauthorized");

  const { data: friendships, error } = await supabaseAdmin
    .from("friendships")
    .select("id, requester_id, created_at")
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!friendships?.length) return [];

  const requesterIds = friendships.map((f) => f.requester_id);

  const { data: requesters, error: usersError } = await supabaseAdmin
    .from("users")
    .select(
      "id, display_name, first_name, last_name, email, image_url, country, city",
    )
    .in("id", requesterIds);

  if (usersError) throw new Error(usersError.message);

  const requesterMap = Object.fromEntries(
    (requesters ?? []).map((u) => [u.id, u]),
  );

  return friendships.map((f) => ({
    ...f,
    requester: requesterMap[f.requester_id] ?? null,
  }));
}

// ─── get accepted friends ────────────────────────────────────────────────────

export async function getFriends() {
  const userId = await getCallerId();
  if (!userId) throw new Error("Unauthorized");

  const { data: friendships, error } = await supabaseAdmin
    .from("friendships")
    .select("id, requester_id, addressee_id, updated_at")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!friendships?.length) return [];

  // The friend is whichever side is not the current user
  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id,
  );

  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .select(
      "id, display_name, first_name, last_name, email, image_url, country, city",
    )
    .in("id", friendIds);

  if (usersError) throw new Error(usersError.message);

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

  return friendships.map((f) => {
    const friendId =
      f.requester_id === userId ? f.addressee_id : f.requester_id;
    return {
      id: f.id,
      friends_since: f.updated_at,
      friend: userMap[friendId] ?? null,
    };
  });
}

// ─── accept ──────────────────────────────────────────────────────────────────

export async function acceptFriendRequest(friendshipId) {
  const userId = await getCallerId();
  if (!userId) throw new Error("Unauthorized");

  console.log(
    `[acceptFriendRequest] CALLED — friendshipId=${friendshipId} by userId=${userId}`,
  );

  const { data, error } = await supabaseAdmin
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("addressee_id", userId) // only the addressee can accept
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw new Error(error.message);

  console.log(
    `[acceptFriendRequest] DB updated OK — requester_id=${data.requester_id} addressee_id=${data.addressee_id}`,
  );

  // Single feed event — stored under the requester's user_id only
  const { insertFeedEvent } =
    await import("@/app/[locale]/lib/services/tasks/feed/feedEvents");
  console.log(
    `[acceptFriendRequest] Calling insertFeedEvent ONCE with userId=${data.requester_id} friend_id=${data.addressee_id}`,
  );
  insertFeedEvent(data.requester_id, "friendship", {
    friend_id: data.addressee_id,
  });

  // Notify the requester — fire and forget
  try {
    const { data: addressee } = await supabaseAdmin
      .from("users")
      .select("display_name, first_name")
      .eq("id", userId)
      .single();

    const name = addressee?.display_name ?? addressee?.first_name ?? "Someone";

    await supabaseAdmin.from("notifications").insert({
      user_id: data.requester_id,
      status: "Friend Request Accepted",
      message: `${name} accepted your friend request! You're now connected on DoIt.`,
      priority: "medium",
      display_name: name,
      has_read: false,
    });
  } catch {
    // Notification failure must never break the accept action
  }

  return data;
}

// ─── decline ─────────────────────────────────────────────────────────────────

export async function declineFriendRequest(friendshipId) {
  const userId = await getCallerId();
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabaseAdmin
    .from("friendships")
    .update({ status: "declined" })
    .eq("id", friendshipId)
    .eq("addressee_id", userId) // only the addressee can decline
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Notify the requester — fire and forget
  try {
    const { data: addressee } = await supabaseAdmin
      .from("users")
      .select("display_name, first_name")
      .eq("id", userId)
      .single();

    const name = addressee?.display_name ?? addressee?.first_name ?? "Someone";

    await supabaseAdmin.from("notifications").insert({
      user_id: data.requester_id,
      status: "Friend Request Declined",
      message: `${name} has reviewed your friend request but isn't ready to connect just yet. Keep building your journey on DoIt!`,
      priority: "low",
      display_name: name,
      has_read: false,
    });
  } catch {
    // Notification failure must never break the decline action
  }

  return data;
}
