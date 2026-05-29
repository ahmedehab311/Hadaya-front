import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import {
  GetSettingsResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
} from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(settingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(settingsTable)
    .values({
      storeName: "Hadaya",
      storePhone: "",
      storeEmail: "",
      deliveryFeeDefault: "25",
      deliveryFeeExpress: "50",
    })
    .returning();
  return created;
}

router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(
    GetSettingsResponse.parse({
      ...settings,
      deliveryFeeDefault: Number(settings.deliveryFeeDefault),
      deliveryFeeExpress: Number(settings.deliveryFeeExpress),
    }),
  );
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const body = UpdateSettingsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const existing = await ensureSettings();

  const updateData: Record<string, unknown> = {};
  if (body.data.storeName !== undefined) updateData.storeName = body.data.storeName;
  if (body.data.storePhone !== undefined) updateData.storePhone = body.data.storePhone;
  if (body.data.storeEmail !== undefined) updateData.storeEmail = body.data.storeEmail;
  if (body.data.deliveryFeeDefault !== undefined) updateData.deliveryFeeDefault = body.data.deliveryFeeDefault.toString();
  if (body.data.deliveryFeeExpress !== undefined) updateData.deliveryFeeExpress = body.data.deliveryFeeExpress.toString();
  if (body.data.deliveryNote !== undefined) updateData.deliveryNote = body.data.deliveryNote;
  if (body.data.bankAccountInfo !== undefined) updateData.bankAccountInfo = body.data.bankAccountInfo;

  const [settings] = await db
    .update(settingsTable)
    .set(updateData as any)
    .where(sql`id = ${existing.id}`)
    .returning();

  res.json(
    UpdateSettingsResponse.parse({
      ...settings,
      deliveryFeeDefault: Number(settings.deliveryFeeDefault),
      deliveryFeeExpress: Number(settings.deliveryFeeExpress),
    }),
  );
});

export default router;
