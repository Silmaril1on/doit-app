"use client";
import Logo from "@/app/[locale]/components/elements/Logo";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useDarkMode } from "@/app/[locale]/lib/providers/DarkModeProvider";
import ToggleButton from "@/app/[locale]/components/buttons/ToggleButton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSelector } from "react-redux";
import Button from "../../components/buttons/Button";
import UserSearch from "../../components/forms/UserSearch";

const Navigation = () => {
  const { isDark, toggle } = useDarkMode();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const currentUser = useSelector(selectCurrentUser);

  return (
    <nav className="px-3 py-1 flex w-full items-center justify-between bg-black">
      <Logo size="sm" />
      <UserSearch />
      <DarkModeSection isDark={isDark} toggle={toggle} />
      <LoginButtonSection locale={locale} currentUser={currentUser} />
    </nav>
  );
};

const DarkModeSection = ({ isDark, toggle }) => {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="text-pink text-lg flex h-6 w-6 items-center justify-center"
      >
        {isDark ? <FaMoon /> : <FaSun />}
      </span>
      <ToggleButton checked={isDark} onChange={toggle} size="md" />
    </div>
  );
};

const LoginButtonSection = ({ locale, currentUser }) => {
  return (
    <>
      {!currentUser && (
        <div className="flex space-x-4">
          <Link href={`/${locale}/login`}>
            <Button text="login" />
          </Link>
          <Link href={`/${locale}/register`}>
            <Button text="register" variant="outline" />
          </Link>
        </div>
      )}
    </>
  );
};

export default Navigation;
