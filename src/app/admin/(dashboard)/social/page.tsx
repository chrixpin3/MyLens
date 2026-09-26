import { getSiteConfig } from "@/lib/data";
import { SocialEditor } from "./SocialEditor";

export const dynamic = "force-dynamic";

export default async function AdminSocialPage() {
  const config = await getSiteConfig();
  return <SocialEditor initial={config} />;
}
