import Input from "./Input";
import UploadImageInput from "./UploadImageInput";
import ToggleButton from "../buttons/ToggleButton";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import ActionButton from "../buttons/ActionButton";
import { MdClose } from "react-icons/md";

const normalizeOptions = (options = []) =>
  options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

// ── individual field renderers ───────────────────────────────────────────────

const SelectField = ({ field, value, onChange, disabled }) => (
  <div>
    <label htmlFor={field.key}>{field.label}</label>
    <div className="relative">
      <select
        id={field.key}
        name={field.key}
        value={value ?? ""}
        disabled={disabled || field.disabled}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="appearance-none pr-9"
      >
        {normalizeOptions(field.options).map(({ label, value: val }) => (
          <option key={val} value={val}>
            {label || "Select…"}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/80">
        <FaChevronDown size={10} />
      </span>
    </div>
  </div>
);

const RadioField = ({ field, value, onChange, disabled }) => (
  <div className="space-y-2">
    <label>{field.label}</label>
    <div className="flex flex-wrap gap-2">
      {normalizeOptions(field.options).map(({ label, value: val }) => {
        const isSelected = value === val;
        return (
          <button
            key={val}
            type="button"
            disabled={disabled || field.disabled}
            onClick={() => onChange(field.key, val)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs rounded-md duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? "border-teal-500 bg-teal-500/20 text-teal-400"
                : "border-teal-500/30 text-teal-500/60 hover:border-teal-500/60 hover:text-teal-500"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                isSelected
                  ? "border-teal-500 bg-teal-500"
                  : "border-teal-500/40"
              }`}
            >
              {isSelected && <FaCheck size={7} className="text-black" />}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

const ToggleField = ({ field, value, onChange, disabled }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <label>{field.label}</label>
    <ToggleButton
      checked={Boolean(value)}
      onChange={(checked) => onChange(field.key, checked)}
      disabled={disabled || field.disabled}
      size="md"
    />
  </div>
);

const TextareaField = ({ field, value, onChange, disabled }) => (
  <div className="space-y-2">
    <label htmlFor={field.key}>{field.label}</label>
    <textarea
      id={field.key}
      name={field.key}
      value={value ?? ""}
      placeholder={field.placeholder ?? ""}
      disabled={disabled || field.disabled}
      rows={field.rows ?? 3}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  </div>
);

const EMPTY_SUBTASK = { label: "", completed: false };

const SubtasksField = ({ field, value, onChange, disabled }) => {
  const subtasks =
    Array.isArray(value) && value.length > 0 ? value : [EMPTY_SUBTASK];

  const handleSubtaskChange = (index, nextValue) => {
    const nextSubtasks = subtasks.map((st, i) =>
      i === index ? { ...st, label: nextValue } : st,
    );
    onChange(field.key, nextSubtasks);
  };

  const handleAddSubtask = () => {
    onChange(field.key, [...subtasks, { ...EMPTY_SUBTASK }]);
  };

  const handleRemoveSubtask = (index) => {
    if (subtasks.length <= 1) {
      onChange(field.key, [{ ...EMPTY_SUBTASK }]);
      return;
    }
    onChange(
      field.key,
      subtasks.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label>{field.label}</label>
        <button
          type="button"
          onClick={handleAddSubtask}
          disabled={disabled || field.disabled}
          className="secondary inline-flex items-center gap-1 text-xs font-semibold text-chino duration-300 cursor-pointer hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-sm leading-none">+</span>
          {field.addLabel || "Add subtask"}
        </button>
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask, index) => (
          <div
            key={`${field.key}-${index}`}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              disabled={disabled || field.disabled}
              placeholder={field.placeholder || `Subtask ${index + 1}`}
              value={
                typeof subtask === "object"
                  ? (subtask.label ?? "")
                  : (subtask ?? "")
              }
              onChange={(event) =>
                handleSubtaskChange(index, event.target.value)
              }
            />
            {subtasks.length > 1 && index > 0 ? (
              <span
                className=" rounded-md cursor-pointer border border-red-600/20 bg-red-700/20 hover:bg-red-700/40 duration-300 p-1 text-red-600"
                disabled={disabled || field.disabled}
                onClick={() => handleRemoveSubtask(index)}
              >
                <MdClose size={16} />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const COLS_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

// ── main component ───────────────────────────────────────────────────────────

const SubmissionForm = ({
  fields = [],
  values = {},
  onChange,
  disabled = false,
  className = "",
  imageField = null, // { value: string|null, onChange: fn }
  wallpaperField = null, // { value: string|null, onChange: fn }
  formId,
  onSubmit,
}) => {
  const renderField = (field) => {
    const value = values[field.key] ?? "";
    const isDisabled = disabled || Boolean(field.disabled);

    switch (field.type) {
      case "select":
        return (
          <SelectField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
          />
        );
      case "radio":
        return (
          <RadioField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
          />
        );
      case "toggle":
        return (
          <ToggleField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
          />
        );
      case "textarea":
        return (
          <TextareaField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
          />
        );
      case "subtasks":
        return (
          <SubtasksField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
          />
        );
      default:
        return (
          <Input
            data={{
              id: field.key,
              name: field.key,
              label: field.label,
              type: field.type ?? "text",
              placeholder: field.placeholder ?? "",
              autoComplete: field.autoComplete,
            }}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            disabled={isDisabled}
          />
        );
    }
  };

  // Grouped format: [{ cols: 2, fields: [...] }, ...]
  const isGrouped = fields.length > 0 && Array.isArray(fields[0]?.fields);

  const content = isGrouped ? (
    <div className={`space-y-3 ${className}`}>
      {(imageField || wallpaperField) && (
        <div className="flex gap-3 items-start">
          {imageField && (
            <div className="shrink-0">
              <UploadImageInput
                value={imageField.value}
                onChange={imageField.onChange}
                disabled={disabled}
                label="Profile Picture"
              />
            </div>
          )}
          {wallpaperField && (
            <div className="flex-1">
              <UploadImageInput
                value={wallpaperField.value}
                onChange={wallpaperField.onChange}
                disabled={disabled}
                label="Cover Photo"
              />
            </div>
          )}
        </div>
      )}
      {fields.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid gap-2 lg:gap-3 ${COLS_CLASS[row.cols] ?? "grid-cols-1"}`}
        >
          {row.fields.map((field) => (
            <div key={field.key}>{renderField(field)}</div>
          ))}
        </div>
      ))}
    </div>
  ) : (
    <div className={`space-y-3  ${className}`}>
      {(imageField || wallpaperField) && (
        <div className="flex gap-3 items-start">
          {imageField && (
            <div className="shrink-0">
              <UploadImageInput
                value={imageField.value}
                onChange={imageField.onChange}
                disabled={disabled}
                label="Profile Picture"
              />
            </div>
          )}
          {wallpaperField && (
            <div className="flex-1">
              <UploadImageInput
                value={wallpaperField.value}
                onChange={wallpaperField.onChange}
                disabled={disabled}
                label="Cover Photo"
              />
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.colSpan === "full" ? "sm:col-span-2" : ""}
          >
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );

  if (typeof onSubmit === "function") {
    return (
      <form id={formId} onSubmit={onSubmit}>
        {content}
      </form>
    );
  }

  return content;
};

export default SubmissionForm;
