import React from "react";
import Button from "../buttons/Button";
import Input from "../forms/Input";

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
  fieldsWrapperClassName = "space-y-5",
  maxWidthClass = "max-w-xl",
}) => {
  return (
    <section
      className={`${maxWidthClass} relative bg-teal-400/10 backdrop-blur-lg overflow-hidden rounded-lg border border-teal-500/20  p-6 `}
    >
      <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-500/40 blur-[80px]" />
      <h1 className="primary mt-3 text-5xl uppercase leading-none text-teal-500">
        {title}
      </h1>

      {subtitle ? (
        <p className="secondary mt-4 text-sm text-chino/75">{subtitle}</p>
      ) : null}

      <form
        className="mt-8 space-y-5 relative z-10"
        onSubmit={onSubmit}
        noValidate
      >
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

        {formExtras ? formExtras : null}

        {error ? (
          <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-teal-400/35 bg-teal-500/10 px-4 py-3 text-sm text-teal-200">
            {successMessage}
          </div>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting}
          text={isSubmitting ? submittingLabel : submitLabel}
        />
      </form>

      {footerText && footerLinkLabel && footerLinkHref ? (
        <div className="mt-6 items-center flex justify-between rounded-xl border border-teal-500/20 bg-black p-5">
          <p className="secondary text-md text-cream font-light">
            {footerText}
          </p>
          <Button text={footerLinkLabel} href={footerLinkHref} />
        </div>
      ) : null}
    </section>
  );
};

export default FromContainer;
