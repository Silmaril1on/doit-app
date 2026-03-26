"use client";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { useUserProfile } from "@/app/[locale]/lib/hooks/userProfileHook";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import { formatDate } from "@/app/[locale]/lib/utils/utils";
import { MdEdit } from "react-icons/md";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";

const FIELD_LABELS = {
  first_name: "First Name",
  last_name: "Last Name",
  date: "Date of Birth",
  sex: "Sex",
  phone_number: "Phone Number",
  address: "Address",
  zip: "ZIP Code",
  city: "City",
  country: "Country",
  updated_at: "Last Updated",
};

const MyProfile = ({ user }) => {
  const { profile, isLoading } = useUserProfile(user);
  const { open } = useModal();

  if (isLoading && !profile) {
    return (
      <div className="p-4 text-chino/60 text-sm secondary">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-crimson text-sm secondary">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      <SectionHeadline
        title="My Profile"
        subtitle="Manage your personal information and settings"
      />
      {/* Main Data */}
      <ItemCard className="flex gap-2 items-center">
        <div className="w-20 h-20 border bg-teal-500 rounded-md">
          <ImageTag
            src={profile.image_url}
            alt={profile.display_name}
            width={80}
            height={80}
          />
        </div>
        <div className="text-cream">
          <h1 className="font-bold">{profile.display_name}</h1>
          <h1 className="">{profile.email}</h1>
          <h1 className="text-xs opacity-80">
            <i className="secondary pr-1"> Member Since</i>{" "}
            <b>{formatDate("created_at", profile.created_at)}</b>
          </h1>
        </div>
        <ActionButton
          className="absolute top-3 right-3"
          icon={<MdEdit />}
          onClick={() => open("editProfile", { profile })}
        />
      </ItemCard>
      {/* Basic Information Section */}
      <ItemCard>
        <h1 className="text-cream mb-2 font-bold text-2xl">
          Basic information
        </h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(FIELD_LABELS).map(([key, label]) => (
            <div
              key={key}
              className="px-3 py-2 space-y-0.5 bg-black/50 backdrop-blur-lg rounded-md"
            >
              <p className="text-chino/60 text-[10px] uppercase secondary font-bold">
                {label}
              </p>
              <p className="text-cream text-sm font-medium secondary">
                {formatDate(key, profile[key])}
              </p>
            </div>
          ))}
        </div>
      </ItemCard>
    </div>
  );
};

export default MyProfile;
