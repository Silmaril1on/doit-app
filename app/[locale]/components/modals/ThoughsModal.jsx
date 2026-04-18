"use client";
import { MdEdit, MdOutlineClose } from "react-icons/md";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  selectModal,
  closeModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import ActionButton from "../buttons/ActionButton";
import BorderSvg from "../elements/BorderSvg";
import { capitalizeFirst, timeAgo } from "../../lib/utils/utils";

const MAX_LENGTH = 1000;

const ReviewAvatar = ({ user }) => {
  if (user?.image_url) {
    return (
      <Image
        src={user.image_url}
        alt={user.display_name ?? "user"}
        width={28}
        height={28}
        className="rounded-md object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-md bg-teal-500/20 flex items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-teal-300 uppercase">
        {(user?.display_name ?? "?")[0]}
      </span>
    </div>
  );
};

const ReviewItem = ({ review, onDelete, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(review.review);
  const [saving, setSaving] = useState(false);

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/task/feed-reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: review.id, review: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onEdit(review.id, trimmed);
      setEditing(false);
    } catch {
      // keep editing open on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex my-4 gap-2.5 group">
      <ReviewAvatar user={review.user} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="center gap-2">
            <span className="text-sm font-bold text-cream secondary truncate">
              {review.user?.display_name}
            </span>
            <span className="text-[10px] text-chino/50 secondary">
              {timeAgo(review.created_at)}
            </span>
          </div>
          {review.is_own && (
            <div className="flex items-center gap-2 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 duration-200">
              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditText(review.review);
                    setEditing(true);
                  }}
                  aria-label="Edit review"
                  className="cursor-pointer text-xs secondary text-teal-400/70 hover:text-teal-400 duration-200"
                >
                  <MdEdit size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(review.id)}
                aria-label="Delete review"
                className="cursor-pointer text-red-400/60 hover:text-red-400 duration-200 text-base leading-none"
              >
                <MdOutlineClose size={16} />
              </button>
            </div>
          )}
        </div>
        {editing ? (
          <div className="mt-1">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full resize-none rounded-lg border border-teal-500/20 bg-black/30 px-2 py-1.5 text-xs text-cream secondary placeholder:text-chino/40 focus:border-teal-500/50 focus:outline-none duration-200"
            />
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editText.trim() || saving}
                className="text-[10px] secondary text-teal-400 hover:text-teal-300 disabled:opacity-40 duration-200"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[10px] secondary text-chino/50 hover:text-chino duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-chino/85 secondary leading-none">
            {capitalizeFirst(review.review)}
          </p>
        )}
      </div>
    </div>
  );
};

const ThoughsModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const currentUser = useSelector(selectCurrentUser);
  const isOpen = modalType === "thoughts";
  const { taskId, taskOwnerId } = modalProps ?? {};

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);

  const onClose = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  // Broadcast count to any listening CardFeedActions whenever reviews change
  useEffect(() => {
    if (!isOpen || !taskId) return;
    window.dispatchEvent(
      new CustomEvent("thoughtsUpdated", {
        detail: { taskId, reviewCount: reviews.length },
      }),
    );
  }, [reviews, isOpen, taskId]);

  // Fetch reviews when modal opens
  useEffect(() => {
    if (!isOpen || !taskId) return;
    setReviews([]);
    setText("");
    setError(null);
    setLoading(true);
    fetch(`/api/user/task/feed-reviews?taskId=${encodeURIComponent(taskId)}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => setError("Failed to load thoughts."))
      .finally(() => setLoading(false));
  }, [isOpen, taskId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);

    // Optimistic — prepend immediately
    const optimistic = {
      id: `opt-${Date.now()}`,
      user_id: currentUser?.id,
      review: trimmed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        display_name: currentUser?.display_name,
        image_url: currentUser?.image_url ?? null,
      },
      is_own: true,
      _optimistic: true,
    };
    setReviews((prev) => [optimistic, ...prev]);
    setText("");

    try {
      const res = await fetch("/api/user/task/feed-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: taskId,
          task_owner_id: taskOwnerId,
          review: trimmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Replace optimistic with real record
      setReviews((prev) =>
        prev.map((r) => (r.id === optimistic.id ? data.review : r)),
      );
    } catch (err) {
      // Revert optimistic on failure
      setReviews((prev) => prev.filter((r) => r.id !== optimistic.id));
      setText(trimmed);
      setError(err.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (reviewId) => {
    // Optimistic remove
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      const res = await fetch(
        `/api/user/task/feed-reviews?reviewId=${encodeURIComponent(reviewId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch {
      // Silently refetch on delete failure
      fetch(`/api/user/task/feed-reviews?taskId=${encodeURIComponent(taskId)}`)
        .then((r) => r.json())
        .then((d) => setReviews(d.reviews ?? []));
    }
  };

  const handleEdit = (reviewId, newText) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, review: newText, updated_at: new Date().toISOString() }
          : r,
      ),
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="thoughts-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="thoughts-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative flex flex-col rounded-t-2xl border border-b-0 border-teal-500/20 bg-teal-400/10 backdrop-blur-xl overflow-hidden"
              style={{ maxHeight: "80dvh" }}
            >
              <BorderSvg strokeWidth={1} fadeAt={0.5} />
              <div className="absolute left-0 top-0 w-[50%] h-[25%] rounded-full bg-teal-500/30 blur-[80px] pointer-events-none" />

              {/* Handle + Header */}
              <div className="relative z-10 px-5 pt-3 pb-3 shrink-0">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-teal-500/30" />
                <div className="flex items-center justify-between">
                  <h2 className="primary text-3xl uppercase leading-none text-teal-500">
                    Thoughts
                  </h2>
                  <ActionButton variant="close" onClick={onClose} />
                </div>
              </div>

              {/* Reviews list — scrollable */}
              <div
                ref={listRef}
                className="relative z-10 flex-1 overflow-y-auto px-5 pb-2 space-y-4 min-h-0"
              >
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-400" />
                  </div>
                )}
                {!loading && reviews.length === 0 && (
                  <p className="secondary py-8 text-center text-sm text-chino/50">
                    No thoughts yet. Be the first.
                  </p>
                )}
                {!loading &&
                  reviews.map((review) => (
                    <ReviewItem
                      key={review.id}
                      review={review}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
              </div>

              {/* Composer — sticky at bottom */}
              <div className="relative z-10 shrink-0 border-t border-teal-500/15 px-4 py-3">
                {error && (
                  <p className="mb-2 text-xs text-red-400 secondary">{error}</p>
                )}
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative flex items-end">
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={MAX_LENGTH}
                      rows={2}
                      placeholder="Share your thought… (Ctrl+Enter to send)"
                      className="resize-none"
                    />
                    <span className="absolute bottom-2.5 right-2.5 text-[10px] text-chino/30 secondary pointer-events-none">
                      {text.length}/{MAX_LENGTH}
                    </span>
                  </div>
                  <ActionButton
                    className="mb-1"
                    variant="send"
                    onClick={handleSend}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThoughsModal;
