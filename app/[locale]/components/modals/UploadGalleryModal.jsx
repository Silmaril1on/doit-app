"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdCheckCircle } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { truncateString } from "@/app/[locale]/lib/utils/utils";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import Button from "@/app/[locale]/components/buttons/Button";
import {
  deleteGalleryPhoto,
  getTaskGallery,
} from "@/app/[locale]/lib/services/tasks/gallery/galleryActions";

const MODAL_TYPE = "uploadGallery";

const UploadGalleryModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const isOpen = modalType === MODAL_TYPE;
  const objective = modalProps?.objective ?? null;
  const subtasks = Array.isArray(objective?.subtasks) ? objective.subtasks : [];
  const hasSubtasks = subtasks.length > 0;

  const NO_SUBTASK_SLOTS = [
    { id: 1, label: "Photo 1" },
    { id: 2, label: "Photo 2" },
    { id: 3, label: "Photo 3" },
  ];
  const displaySlots = hasSubtasks ? subtasks : NO_SUBTASK_SLOTS;

  const [gallery, setGallery] = useState([]);
  // selectedId is the subtask.id value (number), null when none selected
  const [selectedId, setSelectedId] = useState(null);
  const [file, setFile] = useState(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const incomingGallery = Array.isArray(modalProps?.gallery)
      ? modalProps.gallery
      : [];
    setGallery(incomingGallery);
    setSelectedId(null);
    setFile(null);
    setPickerKey((k) => k + 1);
    setUploading(false);
    setDeleting(null);
    setError(null);

    let isAlive = true;

    const loadExistingGallery = async () => {
      if (!objective?.id || incomingGallery.length > 0) {
        return;
      }

      try {
        const { gallery: fetchedGallery = [] } = await getTaskGallery(
          String(objective.id),
        );
        if (!isAlive) return;
        setGallery(
          Array.isArray(fetchedGallery)
            ? fetchedGallery.filter((item) => item && typeof item === "object")
            : [],
        );
      } catch {
        // Keep modal usable even if gallery prefetch fails.
      }
    };

    loadExistingGallery();

    return () => {
      isAlive = false;
    };
  }, [isOpen, objective?.id, modalProps?.gallery]);

  const handleClose = () => {
    dispatch(closeModal());
  };

  // Look up gallery entry by subtask id
  const hasImage = (subtaskId) =>
    gallery.some((g) => Number(g.subtask_id) === Number(subtaskId));

  const handleUpload = async () => {
    if (!file || selectedId === null || !objective?.id) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("objectiveId", String(objective.id));
      formData.append("subtaskId", String(selectedId));

      const res = await fetch("/api/user/task/gallery", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setGallery(data.gallery);

      // Reset picker
      setFile(null);
      setPickerKey((k) => k + 1);
      setSelectedId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (subtaskId) => {
    if (!objective?.id) {
      return;
    }

    setDeleting(subtaskId);
    setError(null);

    try {
      const { gallery: updatedGallery } = await deleteGalleryPhoto(
        String(objective.id),
        String(subtaskId),
      );

      setGallery(updatedGallery);

      if (selectedId === subtaskId) {
        setSelectedId(null);
        setFile(null);
        setPickerKey((k) => k + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Photos"
      maxWidth="max-w-lg"
      footerMode="none"
    >
      <p className="secondary text-sm text-chino/75">
        {objective?.task_title ?? ""}
      </p>

      {/* Upload progress pills */}
      <div className="mt-1">
        <div className="flex gap-2">
          {displaySlots.map((st) => {
            const uploaded = hasImage(st.id);
            return (
              <motion.div
                key={st.id}
                layout
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-md border transition-colors duration-300 ${
                  uploaded
                    ? "bg-green-600/20 border-green-600/30"
                    : "bg-primary/5 border-primary/15"
                }`}
              >
                <span
                  className={`text-base leading-none transition-colors duration-300 ${
                    uploaded ? "text-green-600" : "text-chino/25"
                  }`}
                >
                  {uploaded ? (
                    <MdCheckCircle size={16} />
                  ) : (
                    <span className="secondary text-xs font-bold">
                      #{st.id}
                    </span>
                  )}
                </span>
                <span
                  className={`secondary text-[9px] capitalize truncate w-full text-center px-1 transition-colors duration-300 ${
                    uploaded ? "text-green-400" : "text-chino/30"
                  }`}
                >
                  {truncateString(st.label, 20)}
                </span>
              </motion.div>
            );
          })}
        </div>
        <p className="secondary text-[10px] text-chino/40 mt-2 text-right">
          {gallery.length === displaySlots.length ? (
            <span className="text-teal-400">
              All {displaySlots.length} photos uploaded ✓
            </span>
          ) : (
            <>
              <span className="brightness-140 font-bold">{gallery.length}</span>
              {" / "}
              {displaySlots.length} uploaded
              {" · "}
              <span className="text-chino/60">
                {displaySlots.length - gallery.length} remaining
              </span>
            </>
          )}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {/* Subtask / slot selection */}
        <div>
          <p className="secondary text-[10px] uppercase tracking-widest text-chino/50 mb-2">
            {hasSubtasks ? "Select subtask to upload for" : "Select photo slot"}
          </p>
          <div className="space-y-2">
            {displaySlots.map((st) => {
              const id = st.id;
              const label =
                typeof st === "object" ? st.label : String(st ?? "");
              const uploaded = hasImage(id);
              const isSelected = selectedId === id;

              return uploaded ? (
                <div
                  key={id}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left border-primary/15 bg-black/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="secondary text-sm capitalize text-cream/80">
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(id)}
                      disabled={deleting === id}
                      aria-label={`Delete photo ${id}`}
                      className="cursor-pointer text-red-500 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoMdClose size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedId(id);
                    setFile(null);
                    setPickerKey((k) => k + 1);
                    setError(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left duration-200 ${
                    isSelected
                      ? "border-primary/60 bg-primary/10"
                      : "border-primary/15 bg-black/30 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="secondary text-sm capitalize text-cream/80">
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* File picker - shown once subtask is selected */}
        <AnimatePresence>
          {selectedId !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
            >
              <UploadImageInput
                key={pickerKey}
                label={null}
                maxSizeBytes={2 * 1024 * 1024}
                compressTarget={500 * 1024}
                onChange={(f) => setFile(f)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-red-300 secondary">
            {error}
          </div>
        )}

        {/* Upload button */}
        <AnimatePresence>
          {file && selectedId !== null && (
            <Button
              disabled={uploading}
              onClick={handleUpload}
              variant="outline"
              text={uploading ? "Uploading..." : "Upload Photo"}
            />
          )}
        </AnimatePresence>
      </div>
    </GlobalModal>
  );
};

export default UploadGalleryModal;
