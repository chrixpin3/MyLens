"use client";

/**
 * Network profiling for the ZipLoader.
 *
 * Two strategies, in priority order:
 *
 *  1. **Network Information API** (`navigator.connection`) where available —
 *     Chromium exposes `effectiveType`, `downlink`, `rtt` and `saveData`.
 *     We map those onto a speed tier that drives both the animation's "labour"
 *     and the expected duration of the progress curve.
 *
 *  2. **Real measurement** everywhere else (Safari/Firefox, or a browser that
 *     omits the API). We time actual async work (fetches, uploads) with
 *     `performance.now()` and keep an EWMA of observed durations; we also
 *     sample frame cadence to detect a janky main thread. That gives a
 *     realistic curve instead of a fixed fake timer.
 */

export type SpeedTier = "slow" | "medium" | "fast";
export type ProfileSource = "connection-api" | "measured" | "unknown";

export interface NetworkProfile {
  tier: SpeedTier;
  source: ProfileSource;
  effectiveType: string | null;
  downlinkMbps: number | null;
  rttMs: number | null;
  saveData: boolean;
  /** Expected wall-clock duration for an indeterminate operation, in ms. */
  expectedMs: number;
  /** Progress-curve steepness multiplier (higher = fills faster). */
  rate: number;
}

const TIER_EXPECTED: Record<SpeedTier, number> = {
  slow: 4200,
  medium: 1700,
  fast: 750,
};

const TIER_RATE: Record<SpeedTier, number> = {
  slow: 0.55,
  medium: 1.25,
  fast: 2.4,
};

export const TIER_LABEL: Record<SpeedTier, string> = {
  slow: "Slow connection",
  medium: "Moderate connection",
  fast: "Fast connection",
};

/* ------------------------------------------------------------------ */
/* Observed-duration history (module scoped so it survives re-renders)  */
/* ------------------------------------------------------------------ */

const durationSamples: number[] = [];
let lastFrameInterval = 16.7;

export function recordTaskDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return;
  durationSamples.push(ms);
  if (durationSamples.length > 8) durationSamples.shift();
}

function averageDuration(): number | null {
  if (durationSamples.length === 0) return null;
  const sum = durationSamples.reduce((a, b) => a + b, 0);
  return sum / durationSamples.length;
}

function clearHistory() {
  durationSamples.length = 0;
  lastFrameInterval = 16.7;
}

/* ------------------------------------------------------------------ */
/* Connection API plumbing                                             */
/* ------------------------------------------------------------------ */

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
  typeMatches?: string;
}

export function getConnection(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { connection?: NetworkInformationLike; mozConnection?: NetworkInformationLike; webkitConnection?: NetworkInformationLike };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function tierFromConnection(conn: NetworkInformationLike): SpeedTier {
  const { effectiveType, downlink, saveData } = conn;

  if (saveData) return "slow";
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (effectiveType === "3g") return downlink && downlink > 1.5 ? "medium" : "slow";
  if (effectiveType === "4g") return downlink && downlink < 2 ? "medium" : "fast";
  if (typeof downlink === "number") {
    if (downlink < 1.2) return "slow";
    if (downlink < 6) return "medium";
    return "fast";
  }
  return "medium";
}

/** Sample the main thread's frame cadence to detect a struggling device/network. */
export function sampleFrameCadence(frames = 12): Promise<number> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "undefined") {
      resolve(16.7);
      return;
    }
    const deltas: number[] = [];
    let last = performance.now();
    const tick = (now: number) => {
      deltas.push(now - last);
      last = now;
      if (deltas.length < frames) {
        requestAnimationFrame(tick);
      } else {
        const stable = deltas.slice(2).sort((a, b) => a - b);
        const median = stable[Math.floor(stable.length / 2)] ?? 16.7;
        lastFrameInterval = median;
        resolve(median);
      }
    };
    requestAnimationFrame(tick);
  });
}

function tierFromMeasurements(): SpeedTier {
  const avg = averageDuration();
  if (avg != null) {
    if (avg > 3200) return "slow";
    if (avg > 1200) return "medium";
    if (avg < 450) return "fast";
  }
  // Frame cadence: > 34ms means the main thread is dropping frames.
  if (lastFrameInterval > 34) return "slow";
  if (lastFrameInterval > 21) return "medium";
  return "fast";
}

export function profileNetwork(): NetworkProfile {
  const conn = getConnection();

  if (conn) {
    const tier = tierFromConnection(conn);
    const observed = averageDuration();
    // Real timings win when we have them — they reflect this exact network.
    const expected = observed != null ? Math.max(observed * 1.15, 350) : TIER_EXPECTED[tier];
    return {
      tier,
      source: "connection-api",
      effectiveType: conn.effectiveType ?? null,
      downlinkMbps: typeof conn.downlink === "number" ? conn.downlink : null,
      rttMs: typeof conn.rtt === "number" ? conn.rtt : null,
      saveData: Boolean(conn.saveData),
      expectedMs: expected,
      rate: TIER_RATE[tier],
    };
  }

  return profileMeasured();
}

/**
 * Measurement-only profile: ignores `navigator.connection` entirely and derives
 * everything from observed task durations plus frame cadence. This is the
 * fallback used when `isNetworkAware` is switched off.
 */
export function profileMeasured(): NetworkProfile {
  const tier = tierFromMeasurements();
  const observed = averageDuration();
  return {
    tier,
    source: observed != null || lastFrameInterval !== 16.7 ? "measured" : "unknown",
    effectiveType: null,
    downlinkMbps: null,
    rttMs: null,
    saveData: false,
    expectedMs: observed != null ? Math.max(observed * 1.15, 350) : TIER_EXPECTED[tier],
    rate: TIER_RATE[tier],
  };
}

/** Subscribe to connection changes; returns an unsubscribe fn. */
export function watchConnection(handler: (profile: NetworkProfile) => void) {
  const conn = getConnection();
  if (!conn) return () => {};
  const listener = () => handler(profileNetwork());
  conn.addEventListener("change", listener);
  return () => conn.removeEventListener("change", listener);
}

export { clearHistory as clearNetworkHistory, TIER_EXPECTED, TIER_RATE };
