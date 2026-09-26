import { getServerSession } from "next-auth";
import { connectToDB, isDbConfigured } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { AccountPanel } from "./AccountPanel";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  let username = "photographer";
  let email = "";

  const session = await getServerSession(authOptions);
  const id = session?.user?.id;

  if (isDbConfigured() && id) {
    await connectToDB();
    const user = await User.findById(id).select("username email").lean().exec();
    if (user) {
      username = user.username;
      email = user.email ?? "";
    }
  }

  return <AccountPanel currentUsername={username} currentEmail={email} />;
}
