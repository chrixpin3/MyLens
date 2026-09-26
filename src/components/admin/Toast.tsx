"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, CloseIcon, AlertIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  detail?: string;
}

const ToastContext = createContext<{
  notify: (message: string, tone?: ToastTone, detail?: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastTone = "success", detail?: string) => {
      const id = ++counter;
      setToasts((list) => [...list.slice(-3), { id, message, tone, detail }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[min(92vw,22rem)] flex-col gap-2.5"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 30, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-glass border px-4 py-3.5 backdrop-blur-xl",
                toast.tone === "error"
                  ? "border-white/30 bg-black/85"
                  : "border-white/15 bg-black/75",
              )}
              role={toast.tone === "error" ? "alert" : "status"}
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30"
              >
                {toast.tone === "success" ? (
                  <CheckIcon className="h-3 w-3" />
                ) : toast.tone === "error" ? (
                  <AlertIcon className="h-3 w-3" />
                ) : (
                  <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm text-white">{toast.message}</p>
                {toast.detail && <p className="text-xs text-white/45">{toast.detail}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="ml-auto shrink-0 text-white/40 transition-colors hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
