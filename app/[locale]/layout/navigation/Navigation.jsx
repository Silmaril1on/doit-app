"use client";
import Logo from "@/app/[locale]/components/elements/Logo";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useDarkMode } from "@/app/[locale]/lib/providers/DarkModeProvider";
import ToggleButton from "@/app/[locale]/components/buttons/ToggleButton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Button from "../../components/buttons/Button";

const Navigation = () => {
  const { isDark, toggle } = useDarkMode();
  const activeModeLabel = isDark ? "Dark mode" : "Light mode";
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const currentUser = useSelector(selectCurrentUser);

  return (
    <nav className="p-3 flex w-full items-center justify-between bg-black">
      <Logo size="sm" />
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold secondary">
          {activeModeLabel}
        </span>
        <ToggleButton checked={isDark} onChange={toggle} size="md" />
      </div>

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
    </nav>
  );
};

export default Navigation;
