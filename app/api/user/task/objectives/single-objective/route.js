import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getObjectiveById } from "@/app/[locale]/lib/services/tasks/objectives/myObjectives";

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

    const objectiveId = getObjectiveId(request);
    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }

    const objective = await getObjectiveById(userId, objectiveId);
    return NextResponse.json({ objective }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
