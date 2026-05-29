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
  const [created] = await db.insert(settingsTable).values({}).returning();
  return created;
}

function parseSettings(row: typeof settingsTable.$inferSelect) {
  return {
    ...row,
    deliveryFee: Number(row.deliveryFee),
    freeDeliveryThreshold: Number(row.freeDeliveryThreshold),
    wrappingFee: Number(row.wrappingFee),
    greetingCardFee: Number(row.greetingCardFee),
    socialLinks: (() => {
      try {
        return JSON.parse(row.socialLinks ?? "[]");
      } catch {
        return [];
      }
    })(),
  };
}

router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await ensureSettings();
  res.json(GetSettingsResponse.parse(parseSettings(settings)));
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const body = UpdateSettingsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const existing = await ensureSettings();
  const d = body.data;

  const updateData: Record<string, unknown> = {};

  // General
  if (d.storeNameAr !== undefined) updateData.storeNameAr = d.storeNameAr;
  if (d.storeNameEn !== undefined) updateData.storeNameEn = d.storeNameEn;
  if (d.timezone !== undefined) updateData.timezone = d.timezone;
  if (d.defaultLanguage !== undefined) updateData.defaultLanguage = d.defaultLanguage;
  if (d.logoUrl !== undefined) updateData.logoUrl = d.logoUrl;
  if (d.faviconUrl !== undefined) updateData.faviconUrl = d.faviconUrl;

  // Financial
  if (d.currencyCode !== undefined) updateData.currencyCode = d.currencyCode;
  if (d.currencySymbol !== undefined) updateData.currencySymbol = d.currencySymbol;
  if (d.deliveryTimeAr !== undefined) updateData.deliveryTimeAr = d.deliveryTimeAr;
  if (d.deliveryTimeEn !== undefined) updateData.deliveryTimeEn = d.deliveryTimeEn;
  if (d.deliveryFee !== undefined) updateData.deliveryFee = d.deliveryFee.toString();
  if (d.freeDeliveryThreshold !== undefined) updateData.freeDeliveryThreshold = d.freeDeliveryThreshold.toString();

  // Gifts
  if (d.giftLinkExpiryDays !== undefined) updateData.giftLinkExpiryDays = d.giftLinkExpiryDays;
  if (d.maxGiftMessageLength !== undefined) updateData.maxGiftMessageLength = d.maxGiftMessageLength;
  if (d.defaultGiftMessageAr !== undefined) updateData.defaultGiftMessageAr = d.defaultGiftMessageAr;
  if (d.defaultGiftMessageEn !== undefined) updateData.defaultGiftMessageEn = d.defaultGiftMessageEn;
  if (d.enableGiftWrapping !== undefined) updateData.enableGiftWrapping = d.enableGiftWrapping;
  if (d.wrappingFee !== undefined) updateData.wrappingFee = d.wrappingFee.toString();
  if (d.greetingCardFee !== undefined) updateData.greetingCardFee = d.greetingCardFee.toString();
  if (d.maxRecipientsPerGift !== undefined) updateData.maxRecipientsPerGift = d.maxRecipientsPerGift;

  // Policies & Contact
  if (d.termsAr !== undefined) updateData.termsAr = d.termsAr;
  if (d.termsEn !== undefined) updateData.termsEn = d.termsEn;
  if (d.privacyAr !== undefined) updateData.privacyAr = d.privacyAr;
  if (d.privacyEn !== undefined) updateData.privacyEn = d.privacyEn;
  if (d.returnsAr !== undefined) updateData.returnsAr = d.returnsAr;
  if (d.returnsEn !== undefined) updateData.returnsEn = d.returnsEn;
  if (d.supportEmail !== undefined) updateData.supportEmail = d.supportEmail;
  if (d.phone !== undefined) updateData.phone = d.phone;
  if (d.whatsapp !== undefined) updateData.whatsapp = d.whatsapp;

  // System
  if (d.maintenanceMode !== undefined) updateData.maintenanceMode = d.maintenanceMode;
  if (d.acceptNewOrders !== undefined) updateData.acceptNewOrders = d.acceptNewOrders;

  // Social links
  if (d.socialLinks !== undefined) updateData.socialLinks = JSON.stringify(d.socialLinks);

  // Payments
  if (d.paymentCod !== undefined) updateData.paymentCod = d.paymentCod;
  if (d.paymentCreditCard !== undefined) updateData.paymentCreditCard = d.paymentCreditCard;
  if (d.paymentVodafone !== undefined) updateData.paymentVodafone = d.paymentVodafone;
  if (d.paymentVodafoneWallet !== undefined) updateData.paymentVodafoneWallet = d.paymentVodafoneWallet;
  if (d.paymentVodafoneInstructions !== undefined) updateData.paymentVodafoneInstructions = d.paymentVodafoneInstructions;
  if (d.paymentInstapay !== undefined) updateData.paymentInstapay = d.paymentInstapay;
  if (d.paymentInstapayName !== undefined) updateData.paymentInstapayName = d.paymentInstapayName;
  if (d.paymentInstapayId !== undefined) updateData.paymentInstapayId = d.paymentInstapayId;
  if (d.paymentInstapayInstructions !== undefined) updateData.paymentInstapayInstructions = d.paymentInstapayInstructions;

  const [settings] = await db
    .update(settingsTable)
    .set(updateData as Parameters<typeof db.update>[0] extends object ? typeof updateData : never)
    .where(sql`id = ${existing.id}`)
    .returning();

  res.json(UpdateSettingsResponse.parse(parseSettings(settings)));
});

export default router;
