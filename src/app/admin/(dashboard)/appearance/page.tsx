import { getSiteConfig } from "@/lib/data";
import { AppearanceEditor } from "./AppearanceEditor";

export const dynamic = "force-dynamic";

export default async function AdminAppearancePage() {
  const config = await getSiteConfig();
  return <AppearanceEditor initial={config} />;
}
