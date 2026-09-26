"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  profileMeasured,
  profileNetwork,
  recordTaskDuration,
  sampleFrameCadence,
  watchConnection,
  type NetworkProfile,
  type SpeedTier,
} from "@/lib/network";

export type LoaderPhase = "idle" | "loading" | "done";

export interface UseNetworkAwareLoadingOptions {
  /**
   * Progress asymptotically approaches this value while the real work is still
   * in flight, then snaps to 100 when it resolves. 92 reads as "nearly there"
   * without ever lying about completion.
   */
  threshold?: number;
  /** Never show the loader for less than this, so fast ops don't flash. */
  minVisibleMs?: number;
  /** Label shown under the percentage. */
  label?: string;
  /**
   * false = ignore `navigator.connection` and rely only on measured task
   * durations and frame cadence.
   */
  networkAware?: boolean;
}

export interface NetworkAwareLoading {
  active: boolean;
  progress: number;
  phase: LoaderPhase;
  tier: SpeedTier;
  profile: NetworkProfile;
  message: string;
  startedAt: number;
  /** Wrap a promise: drives the curve, then completes on real resolution. */
  run: <T>(task: Promise<T> | (() => Promise<T>), opts?: { label?: string }) => Promise<T>;
  /** Manual control for operations that report their own progress (XHR upload). */
  start: (opts?: { label?: string }) => void;
  setProgress: (value: number) => void;
  stop: () => void;
  /** Clear immediately, skipping the completion animation. */
  dismiss: () => void;
}

/** Human copy that escalates as a slow operation drags on. */
function messageFor(elapsedMs: number, tier: SpeedTier, label?: string): string {
  const base = label ?? "Unzipping your gallery…";
  if (tier === "slow" && elapsedMs > 9000) return "Still working… slow connection";
  if (tier === "slow" && elapsedMs > 4500) return "Working on a slow connection…";
  if (elapsedMs > 9000) return "Still working…";
  if (elapsedMs > 4000) return "Almost there…";
  return base;
}

/**
 * The engine behind <ZipLoader>. Progress is derived from real timings:
 * an exponential curve scaled by the network profile's rate, converging on
 * `threshold`, and only ever reaching 100 when the awaited work resolves.
 */
export function useNetworkAwareLoading(
  options: UseNetworkAwareLoadingOptions = {},
): NetworkAwareLoading {
  const { threshold = 92, minVisibleMs = 320, label, networkAware = true } = options;
  const profile = useCallback(
    () => (networkAware ? profileNetwork() : profileMeasured()),
    [networkAware],
  );

  const [active, setActive] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [phase, setPhase] = useState<LoaderPhase>("idle");
  const [tier, setTier] = useState<SpeedTier>("medium");
  const [networkProfile, setProfile] = useState<NetworkProfile>(() => profile());
  const [message, setMessage] = useState(label ?? "Unzipping your gallery…");
  const [startedAt, setStartedAt] = useState(0);

  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const visibleSinceRef = useRef(0);
  const overridesRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Calibrate the fallback path on mount (frame cadence + live connection).
  useEffect(() => {
    let cancelled = false;
    sampleFrameCadence().then(() => {
      if (!cancelled && mountedRef.current) setProfile(profile());
    });
    const unwatch = watchConnection((p) => {
      if (mountedRef.current) {
        setProfile(p);
        setTier(p.tier);
      }
    });
    return () => {
      cancelled = true;
      unwatch();
    };
  }, [profile]);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const loop = useCallback(() => {
    const t0 = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - t0) / 1000, 0.1);
      const net = profile();

      if (!overridesRef.current) {
        // Exponential approach to the threshold, rate-scaled by the network.
        const from = progressRef.current;
        const next = from + (threshold / 100 - from) * (1 - Math.exp(-net.rate * dt));
        progressRef.current = Math.min(next, threshold / 100);
        setProgressState(Math.round(progressRef.current * 1000) / 10);
      }

      if (mountedRef.current) {
        setTier(net.tier);
        setMessage(messageFor(now - t0, net.tier, label));
      }

      if (rafRef.current != null) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [label, threshold, profile]);

  const finish = useCallback(() => {
    stopLoop();
    overridesRef.current = false;
    progressRef.current = 1;
    setProgressState(100);
    setPhase("done");

    const elapsedVisible = Date.now() - visibleSinceRef.current;
    const wait = Math.max(0, minVisibleMs - elapsedVisible);
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      setActive(false);
      setPhase("idle");
      setProgressState(0);
      progressRef.current = 0;
    }, wait + 220);
  }, [minVisibleMs, stopLoop]);

  const start = useCallback(
    (opts?: { label?: string }) => {
      if (opts?.label) setMessage(opts.label);
      visibleSinceRef.current = Date.now();
      setStartedAt(Date.now());
      progressRef.current = 0;
      overridesRef.current = false;
      setProgressState(0);
      setPhase("loading");
      setActive(true);
      setProfile(profile());
      setTier(profile().tier);
      loop();
    },
    [loop, profile],
  );

  const setProgress = useCallback(
    (value: number) => {
      // Real (XHR) progress takes over from the estimated curve.
      overridesRef.current = true;
      stopLoop();
      const clamped = Math.max(0, Math.min(100, value));
      progressRef.current = clamped / 100;
      setProgressState(clamped);
    },
    [stopLoop],
  );

  const stop = useCallback(() => {
    stopLoop();
    overridesRef.current = false;
    if (active) finish();
  }, [active, finish, stopLoop]);

  const dismiss = useCallback(() => {
    stopLoop();
    overridesRef.current = false;
    if (!mountedRef.current) return;
    setActive(false);
    setPhase("idle");
    setProgressState(0);
    progressRef.current = 0;
  }, [stopLoop]);

  const run = useCallback(
    async function runWithProgress<T>(
      task: Promise<T> | (() => Promise<T>),
      opts?: { label?: string },
    ): Promise<T> {
      start(opts);
      const t0 = performance.now();
      try {
        const result = await (typeof task === "function" ? task() : task);
        recordTaskDuration(performance.now() - t0);
        finish();
        return result;
      } catch (err) {
        recordTaskDuration(performance.now() - t0);
        stopLoop();
        overridesRef.current = false;
        if (mountedRef.current) {
          setActive(false);
          setPhase("idle");
          setProgressState(0);
        }
        throw err;
      }
    },
    [finish, start, stopLoop],
  );

  return useMemo(
    () => ({
      active,
      progress,
      phase,
      tier,
      profile: networkProfile,
      message,
      startedAt,
      run,
      start,
      setProgress,
      stop,
      dismiss,
    }),
    [
      active,
      progress,
      phase,
      tier,
      networkProfile,
      message,
      startedAt,
      run,
      start,
      setProgress,
      stop,
      dismiss,
    ],
  );
}
