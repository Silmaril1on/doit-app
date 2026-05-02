"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { getTaskGallery } from "@/app/[locale]/lib/services/tasks/gallery/galleryActions";
import Swiper from "@/app/[locale]/components/motion/Swiper";
import ImageTag from "../elements/ImageTag";

const MODAL_TYPE = "viewGallery";
const STATIC_CARD_TEXT = "Captured Progress Moment";

const ViewGalleryModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const isOpen = modalType === MODAL_TYPE;
  const objectiveId = modalProps?.objectiveId
    ? String(modalProps.objectiveId)
    : null;
  const subtasks = Array.isArray(modalProps.subtasks)
    ? modalProps.subtasks
    : [];

  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setError(null);

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

  const labelMap = useMemo(
    () =>
      Object.fromEntries(
        (Array.isArray(modalProps.subtasks) ? modalProps.subtasks : []).map(
          (st, index) => {
            if (typeof st === "object") {
              return [Number(st.id), String(st.label ?? "")];
            }
            return [index + 1, String(st ?? "")];
          },
        ),
      ),
    [modalProps.subtasks],
  );

  const getLabel = (item) => {
    const subtaskId = Number(item?.subtask_id);
    if (!Number.isFinite(subtaskId) || subtasks.length === 0) {
      return null;
    }
    return labelMap[subtaskId] ?? null;
  };

  const total = gallery.length;

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gallery"
      maxWidth="max-w-3xl"
      footerMode="none"
      isLoading={isLoading}
      error={error}
      isEmpty={total === 0}
      emptyMessage="No gallery images uploaded for this task yet."
    >
      <div className="relative center p-3 select-none">
        {!isLoading && !error && total > 0 && (
          <>
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
          </>
        )}
      </div>
    </GlobalModal>
  );
};

export default ViewGalleryModal;
