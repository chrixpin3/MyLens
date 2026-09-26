"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminCard, AdminHeader, apiFetch, useAdminAction } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Field";
import { InboxIcon, MailIcon, TrashIcon } from "@/components/ui/icons";
import { cn, formatDateTime, relativeTime } from "@/lib/utils";
import type { InquiryData } from "@/types";

type Filter = "all" | "unread" | "read";

export function Inbox({ initial, unread }: { initial: InquiryData[]; unread: number }) {
  const [inquiries, setInquiries] = useState<InquiryData[]>(initial);
  const [unreadCount, setUnreadCount] = useState(unread);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(initial[0]?._id ?? null);
  const { perform, saving } = useAdminAction();

  useEffect(() => {
    setInquiries(initial);
    setUnreadCount(unread);
  }, [initial, unread]);

  const list = useMemo(
    () =>
      filter === "unread"
        ? inquiries.filter((i) => !i.read)
        : filter === "read"
          ? inquiries.filter((i) => i.read)
          : inquiries,
    [inquiries, filter],
  );

  const toggleRead = (inquiry: InquiryData) => {
    const read = !inquiry.read;
    setInquiries((all) => all.map((i) => (i._id === inquiry._id ? { ...i, read } : i)));
    setUnreadCount((n) => Math.max(0, n + (read ? -1 : 1)));
    void perform(
      () =>
        apiFetch<{ inquiry: InquiryData; unread: number }>("/api/admin/inquiries", {
          method: "PATCH",
          body: JSON.stringify({ id: inquiry._id, read }),
        }),
      { success: read ? "Marked as read" : "Marked as unread", refresh: false },
    ).then((result) => {
      if (result) setUnreadCount(result.unread);
    });
  };

  const remove = (inquiry: InquiryData) => {
    if (!window.confirm(`Delete the message from ${inquiry.name}?`)) return;
    void perform(
      () => apiFetch(`/api/admin/inquiries?id=${inquiry._id}`, { method: "DELETE" }),
      { label: "Deleting…", success: "Message deleted", refresh: false },
    ).then((result) => {
      if (result !== null) {
        setInquiries((all) => all.filter((i) => i._id !== inquiry._id));
        if (openId === inquiry._id) setOpenId(null);
      }
    });
  };

  const selected = inquiries.find((i) => i._id === openId) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Inquiries"
        description="Every message submitted through the public contact form, newest first. Unread threads are highlighted."
      >
        <span className="rounded-full border border-white/20 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest2 text-white/60">
          {unreadCount} unread
        </span>
      </AdminHeader>

      <div className="flex gap-2">
        {(["all", "unread", "read"] as Filter[]).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? `All (${inquiries.length})` : f === "unread" ? `Unread (${unreadCount})` : "Read"}
          </Chip>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <AdminCard>
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <InboxIcon className="h-9 w-9 text-white/25" />
            <p className="text-sm text-white/40">
              The studio inbox is empty. Messages from the contact form land here.
            </p>
          </div>
        </AdminCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <AdminCard className="max-h-[42rem] overflow-y-auto p-2">
            <ul className="flex flex-col gap-1.5">
              {list.map((inquiry) => (
                <li key={inquiry._id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(inquiry._id);
                      if (!inquiry.read) toggleRead(inquiry);
                    }}
                    aria-current={openId === inquiry._id ? "true" : undefined}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-glass-sm px-4 py-3.5 text-left transition-colors",
                      openId === inquiry._id
                        ? "bg-white/10"
                        : "hover:bg-white/6",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {!inquiry.read && (
                        <span
                          aria-hidden
                          className="block h-1.5 w-1.5 shrink-0 rounded-full bg-white"
                        />
                      )}
                      <span
                        className={cn(
                          "truncate text-sm",
                          inquiry.read ? "text-white/60" : "text-white",
                        )}
                      >
                        {inquiry.name}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[0.58rem] uppercase tracking-widest2 text-white/30">
                        {relativeTime(inquiry.createdAt)}
                      </span>
                    </span>
                    <span className="truncate text-xs text-white/35">
                      {inquiry.message}
                    </span>
                  </button>
                </li>
              ))}
              {list.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-white/30">Nothing here.</li>
              )}
            </ul>
          </AdminCard>

          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <AdminCard
                  title={selected.name}
                  description={formatDateTime(selected.createdAt)}
                  actions={
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        href={`mailto:${selected.email}?subject=Re: your enquiry`}
                        disabled={saving}
                      >
                        <MailIcon className="h-3.5 w-3.5" /> Reply
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleRead(selected)}
                        disabled={saving}
                      >
                        {selected.read ? "Mark unread" : "Mark read"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => remove(selected)}
                        disabled={saving}
                        aria-label={`Delete message from ${selected.name}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  }
                >
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <dt className="eyebrow text-white/30">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${selected.email}`}
                          className="link-underline break-all text-sm text-white/80"
                        >
                          {selected.email}
                        </a>
                      </dd>
                    </div>
                    {selected.phone && (
                      <div className="flex flex-col gap-1">
                        <dt className="eyebrow text-white/30">Phone</dt>
                        <dd>
                          <a
                            href={`tel:${selected.phone}`}
                            className="link-underline text-sm text-white/80"
                          >
                            {selected.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {selected.service && (
                      <div className="flex flex-col gap-1">
                        <dt className="eyebrow text-white/30">Interested in</dt>
                        <dd className="text-sm text-white/80">{selected.service}</dd>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <dt className="eyebrow text-white/30">Status</dt>
                      <dd className="text-sm text-white/80">
                        {selected.read ? "Read" : "Unread"}
                        {selected.notified ? " · emailed" : " · inbox only"}
                      </dd>
                    </div>
                  </dl>

                  <div className="rule-fade my-6" />

                  <p className="whitespace-pre-line text-pretty text-[0.95rem] leading-relaxed text-white/75">
                    {selected.message}
                  </p>
                </AdminCard>
              </motion.div>
            ) : (
              <AdminCard>
                <p className="py-12 text-center text-sm text-white/35">
                  Select a message to read it.
                </p>
              </AdminCard>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
