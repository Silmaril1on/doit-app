import { NextResponse } from "next/server";
import {
  sendFriendRequest,
  getPendingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from "@/app/[locale]/lib/services/user/friendships";

export async function GET() {
  try {
    const requests = await getPendingFriendRequests();
    return NextResponse.json({ requests }, { status: 200 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(request) {
  try {
    const { addresseeId } = await request.json();
    if (!addresseeId)
      return NextResponse.json(
        { error: "addresseeId is required" },
        { status: 400 },
      );

    const friendship = await sendFriendRequest(addresseeId);
    return NextResponse.json({ friendship }, { status: 201 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PATCH(request) {
  try {
    const { friendshipId, action } = await request.json();

    if (!friendshipId)
      return NextResponse.json(
        { error: "friendshipId is required" },
        { status: 400 },
      );

    if (action !== "accept" && action !== "decline")
      return NextResponse.json(
        { error: 'action must be "accept" or "decline"' },
        { status: 400 },
      );

    const friendship =
      action === "accept"
        ? await acceptFriendRequest(friendshipId)
        : await declineFriendRequest(friendshipId);

    return NextResponse.json({ friendship }, { status: 200 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
