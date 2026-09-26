"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AdminCard, AdminHeader, useAdminAction } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { AlertIcon, CheckIcon, LockoutIcon } from "@/components/ui/icons";

export function AccountPanel({ currentUsername, currentEmail }: { currentUsername: string; currentEmail: string }) {
  const router = useRouter();
  const { perform, saving } = useAdminAction();
  const { data: session } = useSession();

  const [identity, setIdentity] = useState({
    username: currentUsername,
    email: currentEmail,
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [identityDone, setIdentityDone] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  const saveIdentity = () =>
    perform(
      async () => {
        const res = await fetch("/api/admin/auth/change-identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(identity),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.fields
              ? Object.values(json.fields as Record<string, string>)[0]
              : json?.error || "Could not update the account.",
          );
        }
        return json;
      },
      {
        label: "Updating your account…",
        success: "Account updated — signing you back in",
        refresh: false,
      },
    ).then((result) => {
      if (result) {
        setIdentityDone(true);
        // The JWT still carries the old username, so force a clean sign-in.
        void signOut({ callbackUrl: "/admin/login" });
        router.refresh();
      }
    });

  const savePassword = () =>
    perform(
      async () => {
        const res = await fetch("/api/admin/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(password),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.fields
              ? Object.values(json.fields as Record<string, string>)[0]
              : json?.error || "Could not change the password.",
          );
        }
        return json;
      },
      { label: "Re-keying your password…", success: "Password changed", refresh: false },
    ).then((result) => {
      if (result) {
        setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordDone(true);
      }
    });

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Account"
        description="Change the username you sign in with, the contact email on the account, and rotate the password. Passwords are re-hashed with bcrypt on every change."
      />

      <AdminCard
        title="Username & email"
        description="Changing the username signs you out so the new one takes effect on the next sign-in."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Username" htmlFor="username" required>
            <Input
              id="username"
              value={identity.username}
              onChange={(e) => setIdentity((i) => ({ ...i, username: e.target.value }))}
              autoCapitalize="none"
              spellCheck={false}
            />
          </Field>
          <Field label="Account email" htmlFor="account-email" hint="Used for NextAuth identification only.">
            <Input
              id="account-email"
              type="email"
              value={identity.email}
              onChange={(e) => setIdentity((i) => ({ ...i, email: e.target.value }))}
              placeholder="Optional"
            />
          </Field>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            onClick={saveIdentity}
            disabled={saving || identity.username.length < 3}
          >
            {saving ? "Saving…" : "Update account"}
          </Button>
          {identityDone && (
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <CheckIcon className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </AdminCard>

      <AdminCard
        title="Change password"
        description="Minimum 10 characters. The stored bcrypt hash is replaced — the plaintext is never written to the database."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Current password" htmlFor="currentPassword" required>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={password.currentPassword}
              onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </Field>
          <Field label="New password" htmlFor="newPassword" required hint="10 characters or more.">
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={password.newPassword}
              onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword" required>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={password.confirmPassword}
              onChange={(e) => setPassword((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
          </Field>
        </div>

        {password.newPassword &&
          password.newPassword.length < 10 && (
            <p className="mt-3 flex items-center gap-2 text-xs text-white/50">
              <AlertIcon className="h-3.5 w-3.5" /> 10 characters minimum — currently{" "}
              {password.newPassword.length}.
            </p>
          )}

        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            onClick={savePassword}
            disabled={
              saving ||
              !password.currentPassword ||
              password.newPassword.length < 10 ||
              password.newPassword !== password.confirmPassword
            }
          >
            {saving ? "Saving…" : "Change password"}
          </Button>
          {passwordDone && (
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              <CheckIcon className="h-3.5 w-3.5" /> Password updated
            </span>
          )}
        </div>
      </AdminCard>

      <div className="glass flex items-start gap-4 rounded-glass-lg p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60">
          <LockoutIcon className="h-4 w-4" />
        </span>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-white/80">Security notes</p>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed text-white/40">
            <li>
              The seed password is public knowledge — change it before the first deployment.
            </li>
            <li>
              Sign-in attempts are counted per IP + username. After 6 failures the account locks
              with an exponential cool-off, and the counter is stored in MongoDB so it survives
              serverless cold starts.
            </li>
            <li>Set SEED_ADMIN_PASSWORD before running the seed script for anything but local work.</li>
            <li>Currently signed in as {session?.user?.name ?? currentUsername}.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
