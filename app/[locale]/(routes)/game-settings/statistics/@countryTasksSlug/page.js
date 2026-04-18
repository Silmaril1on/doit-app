import { cookies } from "next/headers";
import { getTopCountryStats } from "@/app/[locale]/lib/services/statistics/country-based/countryStats";
import CountryTasks from "./CountryTasks";

const CountryTasksSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const { top = [], hasMore = false } = userId
    ? await getTopCountryStats(userId).catch(() => ({
        top: [],
        hasMore: false,
      }))
    : { top: [], hasMore: false };

  return <CountryTasks topStats={top} hasMore={hasMore} userId={userId} />;
};

export default CountryTasksSlug;
