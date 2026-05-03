import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className=" bg-black text-cream page-wrapper">
      <div className="border-b border-primary/20 bg-black/60">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-dashboard/badges-crud"
              className="secondary text-xs text-chino/70 hover:text-primary transition-colors"
            >
              Badges CRUD
            </Link>
            <Link
              href="/admin-dashboard/statistics"
              className="secondary text-xs text-chino/70 hover:text-primary transition-colors"
            >
              Statistics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
