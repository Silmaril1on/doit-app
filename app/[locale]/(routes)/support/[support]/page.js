import React from "react";
import { notFound } from "next/navigation";
import { SUPPORT_PAGE_CONFIGS, VALID_SUPPORT_PAGES } from "./supportPageConfig";
import SupportPageComponent from "./SupportPageComponent";
import { supportData } from "@/app/[locale]/lib/local-bd/supportDb";

export function generateStaticParams() {
  return VALID_SUPPORT_PAGES.map((support) => ({ support }));
}

export async function generateMetadata({ params }) {
  const { support } = await params;
  if (!VALID_SUPPORT_PAGES.includes(support)) return {};
  return SUPPORT_PAGE_CONFIGS[support].metadata;
}

const SupportPage = async ({ params }) => {
  const { support } = await params;
  if (!VALID_SUPPORT_PAGES.includes(support)) notFound();
  const { dataKey } = SUPPORT_PAGE_CONFIGS[support];
  const data = supportData[dataKey] ?? null;

  return <SupportPageComponent type={dataKey} data={data} />;
};

export default SupportPage;
