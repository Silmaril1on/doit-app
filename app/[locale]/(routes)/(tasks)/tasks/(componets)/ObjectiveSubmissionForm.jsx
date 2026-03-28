"use client";

import SubmissionForm from "@/app/[locale]/components/forms/SubmissionForm";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const FIELDS = [
  {
    cols: 1,
    fields: [
      {
        key: "task_title",
        label: "Task Title",
        type: "text",
        placeholder: "Define the objective title",
      },
    ],
  },
  {
    cols: 1,
    fields: [
      {
        key: "task_description",
        label: "Task Description",
        type: "textarea",
        rows: 4,
        placeholder: "Describe what success looks like for this objective",
      },
    ],
  },
  {
    cols: 3,
    fields: [
      {
        key: "country",
        label: "Country (Optional)",
        type: "text",
        placeholder: "Country",
      },
      {
        key: "city",
        label: "City (Optional)",
        type: "text",
        placeholder: "City",
      },
      {
        key: "task_category",
        label: "Task Category",
        type: "text",
        placeholder: "History, Sport, Night Life...",
      },
    ],
  },
  {
    cols: 2,
    fields: [
      {
        key: "task_deadline",
        label: "Task Deadline (Optional)",
        type: "datetime-local",
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
        ],
      },
    ],
  },

  {
    cols: 1,
    fields: [
      {
        key: "subtasks",
        label: "Subtasks",
        type: "subtasks",
        addLabel: "Add subtask",
      },
    ],
  },
];

const EMPTY_SUBTASK = { label: "", completed: false };

const initialForm = {
  task_title: "",
  task_description: "",
  country: "",
  city: "",
  task_category: "",
  priority: "medium",
  task_deadline: "",
  subtasks: [{ ...EMPTY_SUBTASK }],
};

const formatForDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetInMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetInMs).toISOString().slice(0, 16);
};

const createFormFromObjective = (objective) => {
  if (!objective) {
    return initialForm;
  }

  return {
    task_title: objective.task_title || "",
    task_description: objective.task_description || "",
    country: objective.country || "",
    city: objective.city || "",
    task_category: objective.task_category || "",
    priority: objective.priority || "medium",
    task_deadline: formatForDateTimeLocal(objective.task_deadline),
    subtasks:
      Array.isArray(objective.subtasks) && objective.subtasks.length > 0
        ? objective.subtasks
        : [{ ...EMPTY_SUBTASK }],
  };
};

const ObjectiveSubmissionForm = ({
  formId,
  onClose,
  onSubmittingChange,
  objective,
}) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(objective?.id);
  const [form, setForm] = useState(() => createFormFromObjective(objective));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(createFormFromObjective(objective));
  }, [objective]);

  const setSubmittingState = (value) => {
    setSubmitting(value);
    onSubmittingChange?.(value);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearToast());
    setSubmittingState(true);

    try {
      const endpoint = isEditMode
        ? `/api/user/task/objectives?id=${encodeURIComponent(objective.id)}`
        : "/api/user/task/objectives";

      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create objective");
      }

      dispatch(
        setToast({
          type: "success",
          msg: isEditMode
            ? "Objective updated successfully."
            : "Objective created successfully.",
        }),
      );

      if (!isEditMode) {
        setForm(initialForm);
      }
      onClose?.();
    } catch (error) {
      dispatch(
        setToast({
          type: "error",
          msg:
            error instanceof Error
              ? error.message
              : isEditMode
                ? "Failed to update objective"
                : "Failed to create objective",
        }),
      );
    } finally {
      setSubmittingState(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3">
      <SubmissionForm
        fields={FIELDS}
        values={form}
        onChange={handleChange}
        disabled={submitting}
      />
      <p className="secondary text-xs text-chino/70">
        created_at, update_at, user_id and completed_at are managed securely by
        the backend.
      </p>
    </form>
  );
};

export default ObjectiveSubmissionForm;
