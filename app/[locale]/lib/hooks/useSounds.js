"use client";

import { useCallback } from "react";
import { playSound } from "../utils/playsound";

export const useSound = () => {
  const triggerSound = useCallback((name) => {
    playSound(name);
  }, []);

  return {
    playSound: triggerSound,
  };
};
