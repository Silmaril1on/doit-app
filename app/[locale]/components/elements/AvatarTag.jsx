import Link from "next/link";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import { getUserInitials } from "../../lib/utils/utils";
import { CountryFlags } from "./CountryFlags";
import Button from "../buttons/Button";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-20 w-20 text-base",
};

const AvatarTag = ({
  user,
  size = "md",
  className = "",
  href,
  onClick,
  text,
}) => {
  const sizeClasses = sizes[size] ?? sizes.md;
  const initials = getUserInitials(user);
  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : `${user?.display_name}`;

  const wrapperClassName = `flex items-start gap-1 ${className}`;
  const Wrapper = href ? Link : "div";
  const wrapperProps = href
    ? { href, className: wrapperClassName, "aria-label": userName, onClick }
    : { className: wrapperClassName, onClick };

  return (
    <Wrapper {...wrapperProps}>
      <div
        className={`relative shrink-0 overflow-hidden rounded-md border border-teal-500/30 bg-black/40 ${sizeClasses}`}
      >
        {user?.image_url ? (
          <ImageTag
            src={user.image_url}
            alt="user avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-teal-400">
            {initials}
          </div>
        )}
      </div>
      <article className="py-1 ">
        <h1 className="secondary text-[10px] text-chino">
          {user?.display_name}
        </h1>
        <h1 className="text-cream capitalize text-lg leading-none font-bold">
          {userName}
        </h1>
        {(user?.country || user?.city) && (
          <CountryFlags
            size="sm"
            title
            countryName={user?.country}
            cityName={user?.city}
          />
        )}
        {text && (
          <Button text={text} size="sm" variant="outline" onClick={onClick} />
        )}
      </article>
    </Wrapper>
  );
};

export default AvatarTag;
