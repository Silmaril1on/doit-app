"use client";

import ItemCard from "@/app/[locale]/components/container/ItemCard";
import ObjectiveCard from "../(componets)/ObjectiveCard";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ActiveQuests = () => {
  const dispatch = useDispatch();
  const { modalType } = useSelector(selectModal);
  const [quests, setQuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const lastModalTypeRef = useRef(modalType);

  const loadQuests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "/api/user/task/objectives?status=in_progress",
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load active quests");
      }

      setQuests(Array.isArray(data.objectives) ? data.objectives : []);
    } catch (error) {
      dispatch(
        setToast({
          type: "error",
          msg:
            error instanceof Error
              ? error.message
              : "Failed to load active quests",
        }),
      );
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [dispatch]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // Reload when an edit modal closes so changes are reflected
  useEffect(() => {
    const wasEditOpen = lastModalTypeRef.current === "editObjective";
    if (wasEditOpen && modalType === null) loadQuests();
    lastModalTypeRef.current = modalType;
  }, [modalType, loadQuests]);

  return (
    <section className="w-full grow p-4 lg:p-8 flex flex-col gap-3">
      <div className="space-y-1">
        <h1 className="text-3xl text-teal-300">Active Quests</h1>
        <p className="secondary text-sm text-chino">
          Tasks you have started and are currently working on.
        </p>
      </div>

      {isLoading ? (
        <p className="secondary text-sm text-chino/70">
          Loading active quests...
        </p>
      ) : null}

      {!isLoading && hasLoaded && quests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-teal-500/25 bg-black/35 p-6 text-center">
          <p className="secondary text-sm text-chino/80">
            No active quests yet. Start a task from your Objectives to see it
            here.
          </p>
        </div>
      ) : null}

      {!isLoading && quests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {quests.map((quest) => (
            <ObjectiveCard key={quest.id} objective={quest} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default ActiveQuests;
