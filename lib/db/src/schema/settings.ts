import { pgTable, text, serial, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),

  // General
  storeNameAr: text("store_name_ar").notNull().default("هدايا"),
  storeNameEn: text("store_name_en").notNull().default("Hadaya"),
  timezone: text("timezone").notNull().default("Africa/Cairo"),
  defaultLanguage: text("default_language").notNull().default("ar"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),

  // Financial
  currencyCode: text("currency_code").notNull().default("SAR"),
  currencySymbol: text("currency_symbol").notNull().default("ر.س"),
  deliveryTimeAr: text("delivery_time_ar").notNull().default("2-5 أيام عمل"),
  deliveryTimeEn: text("delivery_time_en").notNull().default("2-5 business days"),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("25"),
  freeDeliveryThreshold: numeric("free_delivery_threshold", { precision: 10, scale: 2 }).notNull().default("200"),

  // Gifts
  giftLinkExpiryDays: integer("gift_link_expiry_days").notNull().default(7),
  maxGiftMessageLength: integer("max_gift_message_length").notNull().default(500),
  defaultGiftMessageAr: text("default_gift_message_ar"),
  defaultGiftMessageEn: text("default_gift_message_en"),
  enableGiftWrapping: boolean("enable_gift_wrapping").notNull().default(true),
  wrappingFee: numeric("wrapping_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  greetingCardFee: numeric("greeting_card_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  maxRecipientsPerGift: integer("max_recipients_per_gift").notNull().default(1),

  // Policies & Contact
  termsAr: text("terms_ar"),
  termsEn: text("terms_en"),
  privacyAr: text("privacy_ar"),
  privacyEn: text("privacy_en"),
  returnsAr: text("returns_ar"),
  returnsEn: text("returns_en"),
  supportEmail: text("support_email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp"),

  // System
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  acceptNewOrders: boolean("accept_new_orders").notNull().default(true),

  // SEO & Social
  socialLinks: text("social_links").notNull().default("[]"),

  // Payments — Cash on Delivery
  paymentCod: boolean("payment_cod").notNull().default(true),
  // Payments — Credit Card
  paymentCreditCard: boolean("payment_credit_card").notNull().default(false),
  // Payments — Vodafone Cash
  paymentVodafone: boolean("payment_vodafone").notNull().default(false),
  paymentVodafoneWallet: text("payment_vodafone_wallet"),
  paymentVodafoneInstructions: text("payment_vodafone_instructions"),
  // Payments — Instapay
  paymentInstapay: boolean("payment_instapay").notNull().default(false),
  paymentInstapayName: text("payment_instapay_name"),
  paymentInstapayId: text("payment_instapay_id"),
  paymentInstapayInstructions: text("payment_instapay_instructions"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
