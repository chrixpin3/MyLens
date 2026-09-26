"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ZipLoader } from "@/components/zip/ZipLoader";
import { useNetworkAwareLoading, type NetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

interface LoaderContextValue extends NetworkAwareLoading {
  /** Manual control, for operations with their own modal presentation. */
  open: (opts?: { label?: string; progress?: number }) => void;
  close: () => void;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function useGlobalLoader(): LoaderContextValue {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useGlobalLoader must be used inside <ZipLoaderProvider>");
  return ctx;
}

/**
 * Mounted once in the root layout.
 *
 * - `useGlobalLoader()` gives any client component the shared network-aware
 *   loader for admin saves and uploads.
 * - Route changes are also observed here, so client-side navigation shows the
 *   unzip overlay while the next segment streams in (App Router's
 *   `loading.tsx` covers the server-side wait).
 */
export function ZipLoaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const loader = useNetworkAwareLoading({ label: "Unzipping your gallery…" });
  const [manual, setManual] = useState<{ progress?: number; label?: string } | null>(null);

  const open = useCallback((opts?: { label?: string; progress?: number }) => {
    setManual({ progress: opts?.progress, label: opts?.label });
  }, []);

  const close = useCallback(() => {
    setManual(null);
    loaderRef.current.dismiss();
  }, []);

  // Keep a ref to the live loader so the route effect can depend on `pathname`
  // alone — depending on the loader object would restart it every frame.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const manualOpen = manual !== null;
  const manualProgress = manual?.progress ?? (manualOpen ? loader.progress : undefined);

  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    loaderRef.current.start({ label: "Unzipping your gallery…" });
    // Safety valve: never trap the UI if a navigation resolves but the
    // provider's own state misses the teardown.
    const timer = window.setTimeout(() => {
      if (loaderRef.current.active) loaderRef.current.stop();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const value = useMemo<LoaderContextValue>(
    () => ({ ...loader, open, close }),
    [loader, open, close],
  );

  return (
    <LoaderContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {!manualOpen && loader.active && (
          <motion.div
            key="global-zip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <ZipLoader
              progress={loader.progress}
              isNetworkAware
              variant="overlay"
              label={loader.message}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {manualOpen && (
          <motion.div
            key="manual-zip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <ZipLoader
              progress={manualProgress}
              label={manual?.label}
              isNetworkAware
              variant="modal"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LoaderContext.Provider>
  );
}
