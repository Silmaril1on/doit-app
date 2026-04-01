import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAllActiveQuests,
  updateActiveQuest,
  deleteActiveQuest,
} from "@/app/[locale]/lib/services/tasks/active-quests/myActiveQuests";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

function getQuestId(request) {
  const sp = request.nextUrl.searchParams;
  return sp.get("id") || sp.get("questId") || sp.get("quest_id") || null;
}

export async function GET(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    const { quests, total } = await getAllActiveQuests(userId, {
      limit,
      offset,
    });
    return NextResponse.json({ quests, total }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questId = getQuestId(request);
    if (!questId) {
      return NextResponse.json(
        { error: "questId is required" },
        { status: 400 },
      );
    }

    const payload = await request.json();
    const quest = await updateActiveQuest(userId, questId, payload);

    return NextResponse.json({ quest }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questId = getQuestId(request);
    if (!questId) {
      return NextResponse.json(
        { error: "questId is required" },
        { status: 400 },
      );
    }

    const quest = await deleteActiveQuest(userId, questId);
    return NextResponse.json({ quest }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
