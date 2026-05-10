/**
 * SoundManager — production-grade Howler.js singleton
 *
 * Design goals:
 *  • Zero initialisation on the server (SSR-safe)
 *  • AudioContext unlock on any user gesture so sounds fire immediately,
 *    even on the very first interaction (no "click to hear audio" delay)
 *  • Per-sound anti-spam cooldown to prevent rapid-fire duplicates
 *  • HMR-safe: stored on `window` so hot reloads reuse the same instance
 *  • Persists user mute preference to localStorage
 *  • Unknown sound names warn in dev, silently skip in prod
 */

import { Howl, Howler } from "howler";

// ── Sound registry ────────────────────────────────────────────────────────────
// Add every new sound here. src is resolved relative to /public.
const SOUND_DEFS = {
  count: { src: ["/sounds/count.mp3"], volume: 0.8 },
  close: { src: ["/sounds/close.mp3"], volume: 0.8 },
  // future sounds → just add an entry here
};

const COOLDOWN_MS = 80; // minimum ms between two plays of the same sound
const LS_KEY = "doit-sound-enabled";

// ── Unlock event set ──────────────────────────────────────────────────────────
// We listen on many events so that the AudioContext resumes as soon as the
// user does *anything* — not just a click.
const UNLOCK_EVENTS = [
  "pointerdown",
  "pointermove",
  "scroll",
  "keydown",
  "touchstart",
];

// ── SoundManager class ────────────────────────────────────────────────────────
class SoundManager {
  constructor() {
    this._enabled = true;
    this._sounds = {};
    this._cooldowns = {};
    this._unlocked = false;

    if (typeof window === "undefined") return; // SSR guard

    // Restore persisted preference
    const stored = localStorage.getItem(LS_KEY);
    if (stored === "false") this._enabled = false;

    this._initSounds();
    this._setupUnlock();
  }

  // ── Initialise Howl instances ───────────────────────────────────────────────
  _initSounds() {
    for (const [name, def] of Object.entries(SOUND_DEFS)) {
      this._sounds[name] = new Howl({
        src: def.src,
        volume: def.volume ?? 0.5,
        preload: true,
        html5: false, // Web Audio API — lower latency than HTML5 <audio>
      });
    }
  }

  // ── AudioContext unlock ─────────────────────────────────────────────────────
  // Pre-warm the AudioContext as early as possible so that mount-time sounds
  // (e.g. MotionCount on page load) fire with minimal delay after first gesture.
  _setupUnlock() {
    const resume = () => {
      const ctx = Howler.ctx;
      if (!ctx || ctx.state !== "suspended") {
        this._unlocked = true;
        return;
      }
      ctx
        .resume()
        .then(() => {
          this._unlocked = true;
        })
        .catch(() => {});
    };

    for (const event of UNLOCK_EVENTS) {
      window.addEventListener(event, resume, { once: true, capture: true });
    }
  }

  // ── Play without queue / state checks ──────────────────────────────────────
  _playNow(name) {
    const sound = this._sounds[name];
    if (!sound || !this._enabled) return;
    sound.stop(); // prevent overlap on rapid re-triggers
    sound.play();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Play a registered sound by name.
   * Silently drops if disabled, on cooldown, or AudioContext not yet unlocked.
   */
  play(name) {
    if (!this._enabled) return;

    const sound = this._sounds[name];
    if (!sound) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[SoundManager] Unknown sound: "${name}". Did you add it to SOUND_DEFS?`,
        );
      }
      return;
    }

    // Anti-spam cooldown
    const now = Date.now();
    if (now - (this._cooldowns[name] ?? 0) < COOLDOWN_MS) return;
    this._cooldowns[name] = now;

    // Always call _playNow directly.
    // • If called from a user-gesture handler (button click etc.) the browser
    //   allows AudioContext.resume() inside the gesture scope, so Howler plays
    //   immediately with zero extra async delay.
    // • If called outside a gesture (mount-time, animations), Howler internally
    //   queues the sound and plays it on the next interaction — the
    //   _setupUnlock pre-warm above makes this happen as early as possible.
    this._playNow(name);
  }

  /**
   * Enable or disable all sounds and persist the choice.
   */
  setEnabled(value) {
    this._enabled = Boolean(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, String(this._enabled));
    }
    // Sync Howler's global mute so any in-flight sounds also stop
    Howler.mute(!this._enabled);
  }

  get enabled() {
    return this._enabled;
  }

  mute() {
    this.setEnabled(false);
  }

  unmute() {
    this.setEnabled(true);
  }

  toggle() {
    this.setEnabled(!this._enabled);
  }
}

// ── Server stub ───────────────────────────────────────────────────────────────
const serverStub = {
  play() {},
  mute() {},
  unmute() {},
  toggle() {},
  setEnabled() {},
  get enabled() {
    return true;
  },
};

// ── Singleton ─────────────────────────────────────────────────────────────────
// Stored on `window.__DOIT_SOUND__` so Next.js HMR hot-reloads reuse the
// same Howl instances rather than creating duplicate AudioContexts.
let soundManager;

if (typeof window !== "undefined") {
  if (!window.__DOIT_SOUND__) {
    window.__DOIT_SOUND__ = new SoundManager();
  }
  soundManager = window.__DOIT_SOUND__;
} else {
  soundManager = serverStub;
}

export default soundManager;
