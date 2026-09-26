/**
 * Idempotent seed.
 *
 *   npm run seed
 *
 * Creates the singleton SiteConfig, the demo service list and the single admin
 * user. Re-running it is safe: services are matched by title, the config is
 * upserted on its `key`, and the admin password is only re-hashed when
 * SEED_ADMIN_PASSWORD is supplied.
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectToDB, isDbConfigured } from "./lib/db";
import SiteConfig, { CONFIG_KEY } from "./models/SiteConfig";
import Service from "./models/Service";
import User from "./models/User";
import { DEFAULT_CONFIG } from "./lib/defaults";
import type { SiteConfigData } from "./types";

// Next loads .env.local for the app; `tsx` does not, so mirror that order here.
// dotenv never overwrites an already-set variable, so .env.local wins.
config({ path: ".env.local" });
config({ path: ".env" });

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "photographer";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "adminphotographer@123";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "";

const SEED_SERVICES = [
  {
    title: "Wedding photography",
    description:
      "Full-day coverage of your wedding, from the getting-ready nerves to the last dance. Two photographers, a considered shot list, and a gallery delivered within six weeks.",
    ctaText: "Enquire",
    ctaLink: "/contact",
    icon: "heart",
    order: 0,
    active: true,
  },
  {
    title: "Portrait sessions",
    description:
      "Studio or on location, built around how you actually want to look. Natural light where possible, gentle direction, and retouching that keeps your skin looking like skin.",
    ctaText: "Book a session",
    ctaLink: "/contact",
    icon: "users",
    order: 1,
    active: true,
  },
  {
    title: "Editorial & commercial",
    description:
      "Campaigns, lookbooks and brand stories for studios and in-house teams. Art direction, prop styling and crew included, delivered in both colour and black and white.",
    ctaText: "Start a project",
    ctaLink: "/contact",
    icon: "aperture",
    order: 2,
    active: true,
  },
];

function servicePayload() {
  return SEED_SERVICES.map(({ title, ...rest }) => ({ title, ...rest }));
}

async function seedConfig() {
  const payload: SiteConfigData & { key: string } = {
    key: CONFIG_KEY,
    photographerName: DEFAULT_CONFIG.photographerName,
    tagline: DEFAULT_CONFIG.tagline,
    bio: DEFAULT_CONFIG.bio,
    shortBio: DEFAULT_CONFIG.shortBio,
    profileImage: null,
    logo: null,
    stats: DEFAULT_CONFIG.stats,
    skills: DEFAULT_CONFIG.skills,
    experience: DEFAULT_CONFIG.experience,
    coverageArea: DEFAULT_CONFIG.coverageArea,
    contact: DEFAULT_CONFIG.contact,
    social: DEFAULT_CONFIG.social,
    nav: DEFAULT_CONFIG.nav,
    sections: DEFAULT_CONFIG.sections,
    hero: DEFAULT_CONFIG.hero,
    cta: DEFAULT_CONFIG.cta,
    featuredCount: DEFAULT_CONFIG.featuredCount,
  };

  const result = await SiteConfig.updateOne(
    { key: CONFIG_KEY },
    { $setOnInsert: payload },
    { upsert: true },
  );
  return result.upsertedCount > 0 ? "created" : "already present (left untouched)";
}

async function seedServices() {
  const existing = await Service.find({}, { title: 1 }).lean().exec();
  const known = new Set(existing.map((s) => s.title));

  const created = servicePayload().filter((s) => !known.has(s.title));
  if (created.length > 0) await Service.insertMany(created);

  // Keep the demo order authoritative for any service that does exist.
  await Promise.all(
    servicePayload().map((s) =>
      Service.updateOne({ title: s.title }, { $set: { order: s.order, icon: s.icon } }),
    ),
  );

  return `${created.length} added, ${existing.length} already present`;
}

async function seedAdmin() {
  const existing = await User.findOne({ role: "admin" }).exec();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  if (existing) {
    // Only re-apply the password when an override was requested, so re-seeding
    // cannot silently reset a password the owner has since changed.
    if (process.env.SEED_ADMIN_PASSWORD) {
      existing.passwordHash = hash;
      existing.username = ADMIN_USERNAME;
      if (ADMIN_EMAIL) existing.email = ADMIN_EMAIL;
      await existing.save();
      return "password reset from SEED_ADMIN_PASSWORD";
    }
    return "already present (password left untouched)";
  }

  await User.create({
    username: ADMIN_USERNAME.toLowerCase(),
    email: ADMIN_EMAIL,
    passwordHash: hash,
    role: "admin",
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
  });
  return `created "${ADMIN_USERNAME}"`;
}

async function main() {
  if (!isDbConfigured()) {
    console.error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and fill in your Atlas connection string.",
    );
    process.exit(1);
  }

  await connectToDB();
  console.log(`→ connected to ${mongoose.connection.name}`);

  console.log(`• site config: ${await seedConfig()}`);
  console.log(`• services:    ${await seedServices()}`);
  console.log(`• admin user:  ${await seedAdmin()}`);

  console.log("\nDone. Sign in at /admin/login");
  console.log(`  username: ${ADMIN_USERNAME}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log("  password: adminphotographer@123  ← change this immediately");
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
