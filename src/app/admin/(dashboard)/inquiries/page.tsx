import { connectToDB, isDbConfigured } from "@/lib/db";
import Inquiry from "@/models/Inquiry";
import { Inbox } from "./Inbox";
import type { InquiryData } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  let inquiries: InquiryData[] = [];
  let unread = 0;

  if (isDbConfigured()) {
    await connectToDB();
    inquiries = (await Inquiry.find({})
      .sort({ read: 1, createdAt: -1 })
      .limit(500)
      .lean()
      .exec()) as unknown as InquiryData[];
    unread = await Inquiry.countDocuments({ read: false });
  }

  return <Inbox initial={inquiries} unread={unread} />;
}
