"use client";

import SubmissionForm from "@/app/[locale]/components/forms/SubmissionForm";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import { clearToast, setToast } from "@/app/[locale]/lib/features/toastSlice";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const CATEGORY_OPTIONS = TASK_CATEGORIES.map((c) => ({
  label: c.label,
  value: String(c.id),
}));

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
        type: "select",
        options: [
          { label: "Select a category…", value: "" },
          ...CATEGORY_OPTIONS,
        ],
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
        key: "is_public",
        label: "Public Quest",
        type: "toggle",
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
const CREATE_MODAL_TYPE = "createObjective";
const EDIT_MODAL_TYPE = "editObjective";
const MODAL_FORM_ID = "objective-form-modal";

const initialForm = {
  task_title: "",
  task_description: "",
  country: "",
  city: "",
  task_category: "",
  priority: "medium",
  task_deadline: "",
  is_public: false,
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
    task_category:
      objective.task_category != null ? String(objective.task_category) : "",
    priority: objective.priority || "medium",
    task_deadline: formatForDateTimeLocal(objective.task_deadline),
    is_public: objective.is_public === true,
    subtasks:
      Array.isArray(objective.subtasks) && objective.subtasks.length > 0
        ? objective.subtasks
        : [{ ...EMPTY_SUBTASK }],
  };
};

const CreateTaskModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const objective = modalProps?.objective ?? null;
  const isOpen =
    modalType === CREATE_MODAL_TYPE || modalType === EDIT_MODAL_TYPE;
  const isEditMode = modalType === EDIT_MODAL_TYPE && Boolean(objective?.id);

  const [form, setForm] = useState(() => createFormFromObjective(objective));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setForm(createFormFromObjective(objective));
    setSubmitting(false);
  }, [isOpen, objective]);

  const handleClose = () => {
    dispatch(closeModal());
    setSubmitting(false);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearToast());
    setSubmitting(true);
    try {
      const endpoint = isEditMode
        ? `/api/user/task/objectives?id=${encodeURIComponent(objective.id)}`
        : "/api/user/task/objectives";
      const submitData = { ...form };
      if (isEditMode && objective?.status === "completed") {
        const originalSubtasks = Array.isArray(objective.subtasks)
          ? objective.subtasks.filter(
              (st) => typeof st === "object" && st.label?.trim(),
            )
          : [];
        const newSubtasks = Array.isArray(submitData.subtasks)
          ? submitData.subtasks.filter(
              (st) => typeof st === "object" && st.label?.trim(),
            )
          : [];
        if (newSubtasks.length > originalSubtasks.length) {
          submitData.status = "in_progress";
        }
      }
      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create quest");
      }
      dispatch(
        setToast({
          type: "success",
          msg: isEditMode
            ? "Quest updated successfully."
            : "Quest created successfully.",
        }),
      );

      if (!isEditMode) {
        setForm(initialForm);
      }
      handleClose();
    } catch (error) {
      dispatch(
        setToast({
          type: "error",
          msg:
            error instanceof Error
              ? error.message
              : isEditMode
                ? "Failed to update quest"
                : "Failed to create quest",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEditMode ? "Edit Quest" : "Start New Quest";
  const submitLabel = submitting
    ? "Saving..."
    : isEditMode
      ? "Save Changes"
      : "Start New Quest";

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="max-w-3xl"
      formId={MODAL_FORM_ID}
      submitLabel={submitLabel}
      submitDisabled={submitting}
    >
      <SubmissionForm
        fields={FIELDS}
        values={form}
        onChange={handleChange}
        disabled={submitting}
        formId={MODAL_FORM_ID}
        onSubmit={handleSubmit}
      />
      <p className="secondary text-xs text-chino/70">
        created_at, update_at, user_id and completed_at are managed securely by
        the backend.
      </p>
    </GlobalModal>
  );
};

export default CreateTaskModal;
