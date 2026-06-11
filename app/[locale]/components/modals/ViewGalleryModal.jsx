"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdCheckCircle } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import {
  getTaskGallery,
  deleteGalleryPhoto,
} from "@/app/[locale]/lib/services/tasks/gallery/galleryActions";
import { truncateString } from "@/app/[locale]/lib/utils/utils";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import Button from "@/app/[locale]/components/buttons/Button";
import Swiper from "@/app/[locale]/components/motion/Swiper";
import ImageTag from "../elements/ImageTag";

const MODAL_TYPE = "viewGallery";
const STATIC_CARD_TEXT = "Captured Progress Moment";
const NO_SUBTASK_SLOTS = [
  { id: 1, label: "Photo 1" },
  { id: 2, label: "Photo 2" },
  { id: 3, label: "Photo 3" },
];

const ViewGalleryModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const isOpen = modalType === MODAL_TYPE;

  const objectiveId = modalProps?.objectiveId
    ? String(modalProps.objectiveId)
    : null;
  const objective = modalProps?.objective ?? null;
  const subtasks = useMemo(
    () => (Array.isArray(modalProps?.subtasks) ? modalProps.subtasks : []),
    [modalProps?.subtasks],
  );
  const hasSubtasks = subtasks.length > 0;
  const displaySlots = hasSubtasks ? subtasks : NO_SUBTASK_SLOTS;

  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload state (used when gallery is empty and objective is available)
  const [selectedId, setSelectedId] = useState(null);
  const [file, setFile] = useState(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSelectedId(null);
    setFile(null);
    setPickerKey((k) => k + 1);
    setUploading(false);
    setDeleting(null);

    if (!objectiveId) {
      setGallery([]);
      return;
    }

    let isAlive = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const { gallery: items = [] } = await getTaskGallery(objectiveId);
        if (!isAlive) return;
        setGallery(items.filter((item) => item && typeof item === "object"));
      } catch (err) {
        if (!isAlive) return;
        setGallery([]);
        setError(err instanceof Error ? err.message : "Failed to load gallery");
      } finally {
        if (isAlive) setIsLoading(false);
      }
    };

    load();
    return () => {
      isAlive = false;
    };
  }, [isOpen, objectiveId]);

  const handleClose = () => {
    dispatch(closeModal());
    setGallery([]);
    setError(null);
    setIsLoading(false);
  };

  const hasImage = (subtaskId) =>
    gallery.some((g) => Number(g.subtask_id) === Number(subtaskId));

  const handleUpload = async () => {
    if (!file || selectedId === null || !objectiveId) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("objectiveId", objectiveId);
      formData.append("subtaskId", String(selectedId));

      const res = await fetch("/api/user/task/gallery", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setGallery(data.gallery);
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
    if (!objectiveId) return;
    setDeleting(subtaskId);
    setError(null);
    try {
      const { gallery: updatedGallery } = await deleteGalleryPhoto(
        objectiveId,
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

  const labelMap = useMemo(
    () =>
      Object.fromEntries(
        subtasks.map((st, index) => {
          if (typeof st === "object")
            return [Number(st.id), String(st.label ?? "")];
          return [index + 1, String(st ?? "")];
        }),
      ),
    [subtasks],
  );

  const getLabel = (item) => {
    const subtaskId = Number(item?.subtask_id);
    if (!Number.isFinite(subtaskId) || subtasks.length === 0) return null;
    return labelMap[subtaskId] ?? null;
  };

  const total = gallery.length;
  const showUploadUI = !isLoading && !error && total === 0 && objective;

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showUploadUI ? "Upload Photos" : "Gallery"}
      maxWidth={showUploadUI ? "max-w-lg" : "max-w-3xl"}
      footerMode="none"
      isLoading={isLoading}
      error={!showUploadUI ? error : null}
      isEmpty={!isLoading && !error && total === 0 && !objective}
      emptyMessage="No gallery images uploaded for this task yet."
    >
      {/* ── Slider view: gallery has images ── */}
      {!isLoading && !error && total > 0 && (
        <div className="relative center p-3 select-none">
          <Swiper
            items={gallery}
            cardWidth={304}
            spacing={12}
            mobileOnly={false}
            className="w-full"
          >
            {gallery.map((item, index) => (
              <article
                key={`${item.image_url ?? "img"}-${index}`}
                className="w-full overflow-hidden rounded-2xl backdrop-blur-xl"
              >
                <div className="w-full pointer-events-none">
                  <ImageTag
                    src={item.image_url}
                    alt="Gallery slider"
                    width={0}
                    height={0}
                    sizes="304px"
                    className="w-full h-auto"
                  />
                </div>
                {getLabel(item) && (
                  <div className="p-4 text-center">
                    <p className="secondary text-[22px] leading-tight text-cream/95 capitalize">
                      {getLabel(item)}
                    </p>
                    <h1 className="primary mt-3 text-sm uppercase tracking-[0.14em] text-chino/85">
                      {STATIC_CARD_TEXT}
                    </h1>
                  </div>
                )}
              </article>
            ))}
          </Swiper>
        </div>
      )}

      {/* ── Upload view: gallery is empty but objective is available ── */}
      {showUploadUI && (
        <>
          <p className="secondary text-sm text-chino/75">
            {objective?.task_title ?? ""}
          </p>

          {/* Progress pills */}
          <div className="mt-1">
            <div className="grid grid-cols-4 gap-2">
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
                      className={`text-[9px] capitalize truncate w-full text-center px-1 transition-colors duration-300 ${
                        uploaded ? "text-green-400" : "text-chino/50"
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
                  <span className="brightness-140 font-bold">
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

          <div className="mt-4 space-y-4">
            {/* Slot selection */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-chino/70 mb-2">
                {hasSubtasks
                  ? "Select subtask to upload for"
                  : "Select photo slot"}
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                      <span className="secondary text-sm capitalize text-cream/80">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File picker */}
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
        </>
      )}
    </GlobalModal>
  );
};

export default ViewGalleryModal;
