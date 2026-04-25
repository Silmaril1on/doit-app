"use client";
import { useSelector } from "react-redux";
import { selectColorValue } from "../../lib/features/configSlice";
import { THEME } from "../../lib/utils/themeClasses";

const sizes = {
  sm: {
    track: "w-6 h-3",
    thumb: "w-2 h-2",
    translate: "translate-x-3",
    offset: "top-0.5 left-0.5",
  },
  md: {
    track: "w-12 h-5",
    thumb: "w-4 h-4",
    translate: "translate-x-7",
    offset: "top-0.5 left-0.5",
  },
};

const LayoutToggle = ({
  options = [],
  value,
  onChange,
  size = "md",
  theme,
}) => {
  const t = theme ?? THEME.teal;
  const textSize = size === "sm" ? "text-xs px-3 py-1" : "text-sm px-5 py-2";

  return (
    <div
      className={`inline-flex rounded-md border p-0.5 gap-0.5 ${t.layoutBg}`}
    >
      {options.map((opt) => {
        const label = typeof opt === "string" ? opt : opt.label;
        const val = typeof opt === "string" ? opt : opt.value;
        const active = val === value;

        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange?.(val)}
            className={`rounded-sm font-semibold uppercase duration-300 primary cursor-pointer ${textSize} ${
              active ? t.layoutActive : "text-white hover:text-white/80"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

const ToggleButton = ({
  checked = false,
  onChange,
  size = "md",
  variant,
  options,
  value,
}) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;

  if (variant === "layout") {
    return (
      <LayoutToggle
        options={options}
        value={value}
        onChange={onChange}
        size={size}
        theme={t}
      />
    );
  }

  const s = sizes[size] ?? sizes.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full duration-300 ${checked ? t.switchOn : t.switchOff} ${s.track}`}
    >
      <span
        className={`absolute ${s.offset} inline-block rounded-full ${checked ? t.thumbOn : t.thumbOff} shadow transition-transform duration-300 ${s.thumb} ${
          checked ? s.translate : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default ToggleButton;
