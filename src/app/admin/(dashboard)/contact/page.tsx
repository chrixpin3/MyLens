import { getSiteConfig } from "@/lib/data";
import { ContactForm_ } from "./ContactEditor";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const config = await getSiteConfig();
  return <ContactForm_ initial={config} />;
}
