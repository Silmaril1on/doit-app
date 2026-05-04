import { cookies } from "next/headers";
import { getLocationStats } from "@/app/[locale]/lib/services/tasks/achivements/locationStats";
import LocationsAchivements from "./LocationsAchivements";

const LocationStatSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const stats = userId
    ? await getLocationStats(userId).catch(() => null)
    : null;

  return <LocationsAchivements stats={stats} />;
};

export default LocationStatSlug;
