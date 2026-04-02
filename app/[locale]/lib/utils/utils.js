export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

export const timeAgo = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86_400_000);
  if (date >= yesterdayStart && date < todayStart) return "yesterday";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};
