import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createObjective,
  deleteObjective,
  getAllObjectives,
  updateObjective,
} from "@/app/[locale]/lib/services/tasks/objectives/myObjectives";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { insertTaskRecreate } from "@/app/[locale]/lib/services/tasks/feed/taskRecreates";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

function getObjectiveId(request) {
  const searchParams = request.nextUrl.searchParams;
  return (
    searchParams.get("id") ||
    searchParams.get("objectiveId") ||
    searchParams.get("objective_id")
  );
}

export async function GET(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const limit =
      Number(request.nextUrl.searchParams.get("limit") ?? 0) || undefined;
    const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    const { objectives, total } = await getAllObjectives(userId, {
      status,
      limit,
      offset,
    });
    return NextResponse.json({ objectives, total }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const { originalTaskId, ...createPayload } = payload;

    const objective = await createObjective(userId, createPayload);

    // If this is a recreate, atomically increment recreate_count on the source task
    if (originalTaskId) {
      const { data: source } = await supabaseAdmin
        .from("objectives")
        .select("user_id, recreate_count")
        .eq("id", originalTaskId)
        .maybeSingle();

      if (source) {
        await supabaseAdmin
          .from("objectives")
          .update({ recreate_count: (source.recreate_count ?? 0) + 1 })
          .eq("id", originalTaskId);

        // Persist who recreated what in task_recreates
        try {
          await insertTaskRecreate(
            userId,
            originalTaskId,
            source.user_id,
            objective.id,
          );
        } catch {
          // Tracking failure must never break task creation
        }
      }
    }

    return NextResponse.json({ objective }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectiveId = getObjectiveId(request);
    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }

    const payload = await request.json();
    const objective = await updateObjective(userId, objectiveId, payload);
    return NextResponse.json({ objective }, { status: 200 });
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

    const objectiveId = getObjectiveId(request);
    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }

    const payload = await request.json();
    const objective = await updateObjective(userId, objectiveId, payload);
    return NextResponse.json({ objective }, { status: 200 });
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

    const objectiveId = getObjectiveId(request);
    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }

    const objective = await deleteObjective(userId, objectiveId);
    return NextResponse.json({ objective }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
