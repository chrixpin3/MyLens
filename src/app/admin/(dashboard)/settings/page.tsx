import { getSiteConfig } from "@/lib/data";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const config = await getSiteConfig();
  return <SettingsForm initial={config} />;
}
