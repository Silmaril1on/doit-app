export const formatDate = (key, value) => {
  if (!value) return "—";
  if (key === "created_at" || key === "updated_at") {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return value;
};

export const getUserInitials = (user) => {
  if (!user) return "U";

  const first = String(user.first_name || "")
    .trim()
    .slice(0, 1);
  const last = String(user.last_name || "")
    .trim()
    .slice(0, 1);

  const initials = `${first}${last}`.toUpperCase();
  if (initials) return initials;

  return String(user.display_name || user.email || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase();
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateString = (str, maxLength = 12) => {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
};
