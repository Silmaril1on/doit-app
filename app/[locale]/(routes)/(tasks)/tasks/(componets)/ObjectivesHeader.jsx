"use client";
import { motion } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import DonutChart from "@/app/[locale]/components/elements/DonutChart";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import { useUserProfile } from "@/app/[locale]/lib/hooks/userProfileHook";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { IoIosAdd } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { MdFilterAltOff } from "react-icons/md";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import SearchBar from "@/app/[locale]/components/forms/SearchBar";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { selectXp } from "@/app/[locale]/lib/features/xpSlice";
import { XP_PER_LEVEL } from "@/app/[locale]/lib/services/xp/xpConfig";

const PRIORITY_CONFIG = [
  { key: "low", label: "Low", color: "#0ea5e9" },
  { key: "medium", label: "Medium", color: "#8b5cf6" },
  { key: "high", label: "High", color: "#dc143c" },
];

const GAP = 3;

const ObjectivesHeader = ({
  objectives = [],
  items,
  title = "Objectives",
  subtitle = "Build clear goals, track progress, and keep momentum.",
  buttonLabel,
  showCreateButton = true,
  showControls = true,
  onCreateClick,
  onOpenSidebar,
  filters = {},
  onClearFilters,
  searchQuery = "",
  onSearchChange,
}) => {
  const sourceItems = Array.isArray(items) ? items : objectives;
  const total = sourceItems.length;
  const hasActiveFilters = Object.values(filters).some((v) => v?.length > 0);

  const segments = PRIORITY_CONFIG.map((cfg) => {
    const value = sourceItems.filter(
      (o) => (o.priority || "medium") === cfg.key,
    ).length;
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return { ...cfg, value, percent };
  });

  return (
    <div className="w-full space-y-2">
      <SectionHeadline title={title} subtitle={subtitle} />

      {/* User tasks statistics header section */}
      <ItemCard className="w-full grid gap-3 ">
        <AvatarSide
          title={title}
          subtitle={subtitle}
          buttonLabel={buttonLabel}
          showCreateButton={showCreateButton}
          onCreateClick={onCreateClick}
        />
        <div className="grid grid-cols-2 *:h-full gap-3 items-center">
          <div></div>
          <DonutChart segments={segments} gap={GAP} showLegend />
        </div>
      </ItemCard>
      {/* Filter and Search bar section */}
      {showControls ? (
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
      ) : null}
    </div>
  );
};

const AvatarSide = ({ buttonLabel, showCreateButton, onCreateClick }) => {
  const currentUser = useSelector(selectCurrentUser);
  const { profile } = useUserProfile(currentUser);

  return (
    <div className="flex flex-col justify-center gap-3">
      {profile && (
        <div className="flex items-start gap-3 ">
          <div className="w-auto h-full rounded-lg overflow-hidden shrink-0 border border-teal-500/30 bg-teal-500/20 flex items-center justify-center">
            {profile.image_url ? (
              <ImageTag
                src={profile.image_url}
                alt={profile.display_name}
                width={120}
                height={120}
              />
            ) : (
              <FaUser size={48} className="text-teal-400/60 m-4" />
            )}
          </div>
          <div className="leading-none h-auto w-full py-1 flex flex-col items-start justify-start space-y-3">
            <div className="*:leading-none ">
              <p className=" text-cream font-semibold text-lg">
                {profile.display_name}
              </p>
              <CountryFlags
                data={{ country: profile.country, city: profile.city }}
                title={true}
                size="sm"
              />
            </div>
            <LevelBar />
            {showCreateButton ? (
              <Button
                className="w-fit"
                icon={<IoIosAdd size={20} />}
                text={buttonLabel}
                onClick={onCreateClick}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

const LevelBar = () => {
  const { level, currentXp } = useSelector(selectXp);
  const pct = Math.min((currentXp / XP_PER_LEVEL) * 100, 100);
  return (
    <div className="flex items-center gap-2 flex-1 w-full">
      <span className="text-[10px] font-bold text-teal-400 secondary shrink-0 leading-none">
        Lv.{level}
      </span>
      <div className="relative flex-1 h-3 rounded-full bg-teal-500/10 border border-teal-500/20 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-teal-600 to-teal-400"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[9px] secondary text-cream/40 shrink-0 leading-none">
        {currentXp}/{XP_PER_LEVEL}
      </span>
    </div>
  );
};

export default ObjectivesHeader;
