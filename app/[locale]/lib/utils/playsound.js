import soundManager from "./SoundManager";

export const playSound = (name) => {
  soundManager.play(name);
};
