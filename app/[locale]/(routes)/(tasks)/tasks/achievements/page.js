import { cookies } from "next/headers";
import { getAllAchievements } from "@/app/[locale]/lib/services/tasks/achivements/myAchievements";
import { batchGetTaskLikesStatus } from "@/app/[locale]/lib/services/tasks/feed/taskLikes";
import { batchGetTaskReviewCounts } from "@/app/[locale]/lib/services/tasks/feed/taskReviews";
import Achievements from "./Achievements";

const AchievementsPage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  let initialData = null;
  if (userId) {
    try {
      const { achievements, total } = await getAllAchievements(userId, {
        limit: 20,
        offset: 0,
      });
      const taskIds = achievements.map((a) => a.id);
      const [likesStatus, reviewsStatus] = await Promise.all([
        batchGetTaskLikesStatus(taskIds),
        batchGetTaskReviewCounts(taskIds),
      ]);
      const enriched = achievements.map((a) => ({
        ...a,
        like_count: likesStatus[a.id]?.like_count ?? 0,
        is_liked: likesStatus[a.id]?.is_liked ?? false,
        review_count: reviewsStatus[a.id]?.review_count ?? 0,
        is_reviewed: reviewsStatus[a.id]?.is_reviewed ?? false,
      }));
      initialData = { achievements: enriched, total };
    } catch {
      // silently fall through — client SWR will fetch on mount
    }
  }

  return <Achievements initialData={initialData} userId={userId} />;
};

export default AchievementsPage;
