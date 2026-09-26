import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectToDB, errorResponse, isDbConfigured, ok } from "@/lib/db";
import Service from "@/models/Service";
import { revalidateSite } from "@/lib/data";
import { fieldErrors, serviceReorderSchema, serviceSchema } from "@/lib/validation";
import { isMongoId } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Admin: full service list, including hidden ones. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return ok([]);

  try {
    await connectToDB();
    const services = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean().exec();
    return ok(services);
  } catch (err) {
    console.error("[api/admin/services] GET failed:", err);
    return errorResponse("Could not load services");
  }
}

/** Admin: create a service. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = await request.json().catch(() => null);
    const parsed = serviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();

    const { order, ...rest } = parsed.data;
    // Append to the end unless an explicit order was provided.
    const count = await Service.countDocuments();
    const created = await Service.create({ ...rest, order: order ?? count });

    await revalidateSite();
    return ok(created.toObject(), 201);
  } catch (err) {
    console.error("[api/admin/services] POST failed:", err);
    return errorResponse("Could not create the service");
  }
}

/** Admin: update a service. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = (await request.json().catch(() => null)) as { id?: string } | null;
    if (!body?.id || !isMongoId(body.id)) return errorResponse("Invalid service id", 400);

    // `partial()` strips the unknown `id` key for us.
    const parsed = serviceSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Some fields need attention", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();
    const updated = await Service.findByIdAndUpdate(
      body.id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();

    if (!updated) return errorResponse("Service not found", 404);

    await revalidateSite();
    return ok(updated);
  } catch (err) {
    console.error("[api/admin/services] PUT failed:", err);
    return errorResponse("Could not update the service");
  }
}

/** Admin: bulk reorder. A swap changes two rows, so both are written at once. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const body = await request.json().catch(() => null);
    const parsed = serviceReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid reorder payload", fields: fieldErrors(parsed.error) },
        { status: 422 },
      );
    }

    await connectToDB();
    await Service.bulkWrite(
      parsed.data.items.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order } },
        },
      })),
    );

    await revalidateSite();
    return ok({ updated: parsed.data.items.length });
  } catch (err) {
    console.error("[api/admin/services] PATCH failed:", err);
    return errorResponse("Could not reorder services");
  }
}

/** Admin: delete a service. */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured()) return errorResponse("Database not configured", 503);

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !isMongoId(id)) return errorResponse("Invalid service id", 400);

    await connectToDB();
    const deleted = await Service.findByIdAndDelete(id).lean().exec();
    if (!deleted) return errorResponse("Service not found", 404);

    await revalidateSite();
    return ok({ id });
  } catch (err) {
    console.error("[api/admin/services] DELETE failed:", err);
    return errorResponse("Could not delete the service");
  }
}
