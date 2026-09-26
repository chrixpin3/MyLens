"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { loginSchema } from "@/lib/validation";
import { useGlobalLoader } from "@/components/zip/ZipLoaderProvider";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loader = useGlobalLoader();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/admin/settings";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Already signed in? Skip the form.
  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      await loader.run(
        (async () => {
          const result = await signIn("credentials", {
            username: values.username,
            password: values.password,
            redirect: false,
            callbackUrl,
          });
          if (!result || result.error) {
            throw new Error(
              result?.error === "CredentialsSignin"
                ? "Those credentials do not match."
                : "Sign-in failed. Please try again.",
            );
          }
          return result;
        })(),
        { label: "Unlocking the studio…" },
      );
      router.replace(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative w-full max-w-md overflow-hidden rounded-glass-lg p-8 sm:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-32 opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2), transparent 60%)" }}
      />

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="eyebrow text-white/40">Private area</span>
          <h1 className="text-fluid-2xl leading-tight">Studio dashboard</h1>
          <p className="text-sm text-white/45">
            Sign in to manage content, uploads and enquiries.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {error && (
            <div
              role="alert"
              className="rounded-glass-sm border border-white/25 bg-white/8 px-4 py-3 text-sm"
            >
              <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle" />
              {error}
            </div>
          )}

          <Field label="Username" htmlFor="username" required error={errors.username?.message}>
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="photographer"
              {...register("username")}
            />
          </Field>

          <Field label="Password" htmlFor="password" required error={errors.password?.message}>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••"
                className="pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/8 hover:text-white"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="rule-fade" />

        <div className="flex flex-col gap-2 text-xs text-white/30">
          <p>
            Rate limited after 6 failed attempts, with an exponential cool-off.
          </p>
          <Link href="/" className="link-underline w-fit text-white/50">
            ← Back to the site
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
