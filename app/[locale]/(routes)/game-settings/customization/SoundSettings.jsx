"use client";

import { useEffect, useState } from "react";
import ToggleButton from "@/app/[locale]/components/buttons/ToggleButton";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import soundManager from "@/app/[locale]/lib/utils/SoundManager";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";

const LS_KEY = "doit-sound-enabled";

const SoundSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored !== null) setEnabled(stored !== "false");
  }, []);

  const handleToggle = async (next) => {
    setEnabled(next);
    localStorage.setItem(LS_KEY, String(next));

    // Sync SoundManager singleton immediately
    if (next) soundManager.unmute();
    else soundManager.mute();

    // Persist to server
    setSaving(true);
    try {
      await fetch("/api/user/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sound_value: next }),
      });
    } catch {
      // non-fatal — localStorage is the source of truth
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeadline
        title="Sound"
        subtitle="Enable or disable in-app sound effects"
      />
      <ItemCard>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary text-xl">
              {enabled ? <HiVolumeUp /> : <HiVolumeOff />}
            </div>
            <div>
              <p className=" text-sm text-cream">Sound Effects</p>
              <p className="secondary text-[11px] text-cream/40">
                {enabled ? "Sound is on" : "Sound is off"}
                {saving && (
                  <span className="ml-2 text-primary/60">saving…</span>
                )}
              </p>
            </div>
          </div>

          <ToggleButton checked={enabled} onChange={handleToggle} size="md" />
        </div>
      </ItemCard>
    </div>
  );
};

export default SoundSettings;
