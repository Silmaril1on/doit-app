"use client";
import React from "react";
import Button from "../buttons/Button";
import Input from "../forms/Input";
import { getPasswordStrength } from "@/app/[locale]/lib/utils/regValidation";
import BorderSvg from "../elements/BorderSvg";
import { useSelector } from "react-redux";
import { selectColorValue } from "@/app/[locale]/lib/features/configSlice";
import { THEME } from "@/app/[locale]/lib/utils/themeClasses";

const FromContainer = ({
  title,
  subtitle,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  error,
  successMessage,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  fields = [],
  values = {},
  onFieldChange,
  formExtras,
  oauthSlot,
  submitDisabled = false,
  fieldsWrapperClassName = "space-y-5",
  maxWidthClass = "max-w-xl",
  passwordValue = "",
}) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;
  const passwordStrength = getPasswordStrength(passwordValue);
  const shouldShowStrength = passwordValue.length > 0;
  return (
    <section
      className={`${maxWidthClass} relative ${t.cardBg} backdrop-blur-lg overflow-hidden rounded-lg p-3 lg:p-5 `}
    >
      <BorderSvg strokeWidth={0.6} />
      <div
        className={`absolute left-0 top-0 w-[40%] h-[30%] rounded-full ${t.formGlow} blur-[80px]`}
      />
      {title && (
        <h1
          className={`primary mt-3 text-5xl uppercase leading-none ${t.titleText}`}
        >
          {title}
        </h1>
      )}

      {subtitle ? (
        <p className="secondary mt-4 text-sm text-chino/75">{subtitle}</p>
      ) : null}

      <form className="space-y-5 relative z-10" onSubmit={onSubmit} noValidate>
        <div className={fieldsWrapperClassName}>
          {fields.map((field) => (
            <div key={field.id} className={field.wrapperClassName || ""}>
              <Input
                data={field}
                value={values[field.name] ?? ""}
                onChange={onFieldChange?.(field.name)}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>

        {shouldShowStrength && (
          <div className="rounded-xl border border-teal-500/25 bg-black/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="secondary text-xs uppercase tracking-[0.16em] text-white/65">
                Password Strength
              </p>
              <p className={`primary text-sm ${passwordStrength.textClass}`}>
                {passwordStrength.label}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={`h-1.5 rounded-full ${
                    passwordStrength.score >= step
                      ? passwordStrength.barClass
                      : "bg-white/15"
                  }`}
                />
              ))}
            </div>
            <p className="secondary mt-2 text-xs text-white/70">
              {passwordStrength.hint}
            </p>
          </div>
        )}

        {formExtras ? formExtras : null}

        {error ? (
          <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${t.successBorder} ${t.successBg} ${t.successText}`}
          >
            {successMessage}
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button
            variant="outline"
            type="submit"
            disabled={isSubmitting || submitDisabled}
            text={isSubmitting ? submittingLabel : submitLabel}
          />
        </div>

        {oauthSlot && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`h-px flex-1 ${t.modalBorder} border-t`} />
              <span className="secondary text-xs text-white/40 uppercase tracking-widest">
                or
              </span>
              <span className={`h-px flex-1 ${t.modalBorder} border-t`} />
            </div>
            {oauthSlot}
          </div>
        )}
      </form>

      {footerText && footerLinkLabel && footerLinkHref ? (
        <div
          className={`mt-6 items-center flex justify-between rounded-xl border ${t.modalBorder} bg-black/30 p-5`}
        >
          <p className="secondary text-md text-cream font-light">
            {footerText}
          </p>
          <Button
            variant="outline"
            text={footerLinkLabel}
            href={footerLinkHref}
          />
        </div>
      ) : null}
    </section>
  );
};

export default FromContainer;
