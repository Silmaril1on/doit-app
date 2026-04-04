"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdCheckCircle } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import { truncateString } from "@/app/[locale]/lib/utils/utils";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import Button from "@/app/[locale]/components/buttons/Button";
import { deleteGalleryPhoto } from "@/app/[locale]/lib/services/tasks/gallery/galleryActions";

const UploadGalleryModal = ({
  objective,
  gallery: initialGallery = [],
  onClose,
  onUploaded,
}) => {
  const subtasks = Array.isArray(objective.subtasks) ? objective.subtasks : [];
  const hasSubtasks = subtasks.length > 0;

  const NO_SUBTASK_SLOTS = [
    { id: 1, label: "Photo 1" },
    { id: 2, label: "Photo 2" },
    { id: 3, label: "Photo 3" },
  ];
  const displaySlots = hasSubtasks ? subtasks : NO_SUBTASK_SLOTS;

  const [gallery, setGallery] = useState(initialGallery);
  // selectedId is the subtask.id value (number), null when none selected
  const [selectedId, setSelectedId] = useState(null);
  const [file, setFile] = useState(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  const overlayRef = useRef(null);

  // Look up gallery entry by subtask id
  const hasImage = (subtaskId) =>
    gallery.some((g) => Number(g.subtask_id) === Number(subtaskId));

  const handleUpload = async () => {
    if (!file || selectedId === null) return;

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
      onUploaded?.(data.gallery);

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
    setDeleting(subtaskId);
    setError(null);

    try {
      const { gallery: updatedGallery } = await deleteGalleryPhoto(
        String(objective.id),
        String(subtaskId),
      );

      setGallery(updatedGallery);
      onUploaded?.(updatedGallery);

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
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onPointerDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg"
      >
        {/* FromContainer-style card */}
        <div className="relative bg-teal-400/10 backdrop-blur-lg overflow-hidden rounded-lg border border-teal-500/20 p-6">
          {/* <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-500/40 blur-[80px] pointer-events-none" /> */}

          {/* Header */}
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="leading-none">
              <h1 className="primary text-4xl uppercase leading-none text-teal-500">
                Upload Photos
              </h1>
              <p className="secondary mt-1 text-sm text-chino/75">
                {objective.task_title}
              </p>
            </div>
            <ActionButton onClick={onClose} variant="close" />
          </div>

          {/* Upload progress pills */}
          <div className="mt-5 relative z-10">
            <div className="flex gap-2">
              {displaySlots.map((st) => {
                const uploaded = hasImage(st.id);
                return (
                  <motion.div
                    key={st.id}
                    layout
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-md border transition-colors duration-300 ${
                      uploaded
                        ? "bg-green-500/20 border-green-500/50"
                        : "bg-teal-500/5 border-teal-500/15"
                    }`}
                  >
                    <span
                      className={`text-base leading-none transition-colors duration-300 ${
                        uploaded ? "text-green-500" : "text-chino/25"
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
                  <span className="text-green-500 font-bold">
                    {gallery.length}
                  </span>
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

          <div className="mt-4 space-y-4 relative z-10">
            {/* Subtask / slot selection */}
            <div>
              <p className="secondary text-[10px] uppercase tracking-widest text-chino/50 mb-2">
                {hasSubtasks
                  ? "Select subtask to upload for"
                  : "Select photo slot"}
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
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left border-teal-500/15 bg-black/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="secondary text-[10px] text-chino/40 shrink-0">
                          #{id}
                        </span>
                        <span className="secondary text-sm capitalize text-cream/80">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 secondary text-[10px] text-green-500">
                          <MdCheckCircle size={12} />
                          Uploaded
                        </span>
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
                          ? "border-teal-500/60 bg-teal-500/10"
                          : "border-teal-500/15 bg-black/30 hover:border-teal-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="secondary text-[10px] text-chino/40 shrink-0">
                          #{id}
                        </span>
                        <span className="secondary text-sm capitalize text-cream/80">
                          {label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File picker — shown once subtask is selected */}
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
                  text={uploading ? "Uploading…" : "Upload Photo"}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadGalleryModal;
