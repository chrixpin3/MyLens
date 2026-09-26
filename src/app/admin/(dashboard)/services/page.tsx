import { connectToDB, isDbConfigured } from "@/lib/db";
import Service from "@/models/Service";
import { ServicesManager } from "./ServicesManager";
import type { ServiceData } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  let services: ServiceData[] = [];
  if (isDbConfigured()) {
    await connectToDB();
    services = (await Service.find({}).sort({ order: 1, createdAt: 1 }).lean().exec()) as unknown as ServiceData[];
  }
  return <ServicesManager initial={services} />;
}
