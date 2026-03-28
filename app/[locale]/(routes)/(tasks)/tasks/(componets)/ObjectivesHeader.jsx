import React from "react";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import DonutChart from "@/app/[locale]/components/elements/DonutChart";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import { useUserProfile } from "@/app/[locale]/lib/hooks/userProfileHook";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { IoIosAdd } from "react-icons/io";
import { MdFilterAltOff } from "react-icons/md";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import SearchBar from "@/app/[locale]/components/forms/SearchBar";

const PRIORITY_CONFIG = [
  { key: "low", label: "Low", color: "#0ea5e9" },
  { key: "medium", label: "Medium", color: "#8b5cf6" },
  { key: "high", label: "High", color: "#dc143c" },
];

const GAP = 3;

const TasksHeader = ({
  objectives = [],
  buttonLabel,
  onCreateClick,
  onOpenSidebar,
  filters = {},
  onClearFilters,
  searchQuery = "",
  onSearchChange,
}) => {
  const total = objectives.length;
  const hasActiveFilters = Object.values(filters).some((v) => v?.length > 0);

  const segments = PRIORITY_CONFIG.map((cfg) => {
    const value = objectives.filter(
      (o) => (o.priority || "medium") === cfg.key,
    ).length;
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return { ...cfg, value, percent };
  });

  return (
    <div className="w-full space-y-2">
      {/* User tasks statistics header section */}
      <ItemCard className="w-full grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <AvatarSide buttonLabel={buttonLabel} onCreateClick={onCreateClick} />
          <div className="w-full *:w-full"></div>
        </div>
        <div className="grid grid-cols-2 *:h-full gap-3 items-center">
          <div></div>
          <DonutChart segments={segments} gap={GAP} showLegend />
        </div>
      </ItemCard>
      {/* Filter and Search bar section */}
      <div className="flex items-center gap-2">
        <ActionButton variant="menu" onClick={onOpenSidebar} />
        {hasActiveFilters && (
          <ActionButton
            icon={<MdFilterAltOff />}
            onClick={onClearFilters}
            ariaLabel="Clear filters"
          />
        )}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search objectives…"
          className="flex-1"
        />
      </div>
    </div>
  );
};

const AvatarSide = ({ buttonLabel, onCreateClick }) => {
  const currentUser = useSelector(selectCurrentUser);
  const { profile } = useUserProfile(currentUser);

  return (
    <div className="flex flex-col justify-center gap-3">
      <div className="*:leading-none">
        <h1 className="text-3xl text-teal-300">Objectives</h1>
        <p className="secondary text-sm text-chino">
          Build clear goals, track progress, and keep momentum.
        </p>
      </div>
      {profile && (
        <div className="flex items-center gap-3 ">
          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-teal-500/30 bg-teal-500/20">
            <ImageTag
              src={profile.image_url}
              alt={profile.display_name}
              width={96}
              height={96}
            />
          </div>
          <div className="leading-none h-full w-full pt-2 flex flex-col justify-between items-start">
            <div className="*:leading-none">
              <p className=" text-cream font-semibold text-lg">
                {profile.display_name}
              </p>
              <CountryFlags
                data={{ country: profile.country, city: profile.city }}
                title={true}
                size="sm"
              />
              <h1 className="text-green-600 secondary text-sm">
                Verified Account
              </h1>
            </div>
            <Button
              className="w-full"
              icon={<IoIosAdd size={20} />}
              text={buttonLabel}
              onClick={onCreateClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksHeader;
