import BadgesCrud from "./BadgesCrud";
import {
  getAdminCategories,
  getAdminTiers,
} from "@/app/[locale]/lib/services/admin/badgesAdmin";

export const metadata = {
  title: "Badges CRUD — Admin",
  description: "Manage task categories and achievement tiers.",
};

export default async function BadgesCrudPage() {
  const [categories, tiers] = await Promise.all([
    getAdminCategories().catch(() => []),
    getAdminTiers().catch(() => []),
  ]);

  return <BadgesCrud initialCategories={categories} initialTiers={tiers} />;
}
