import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull().default("Hadaya"),
  storePhone: text("store_phone").notNull().default(""),
  storeEmail: text("store_email").notNull().default(""),
  deliveryFeeDefault: numeric("delivery_fee_default", { precision: 10, scale: 2 }).notNull().default("25"),
  deliveryFeeExpress: numeric("delivery_fee_express", { precision: 10, scale: 2 }).notNull().default("50"),
  deliveryNote: text("delivery_note"),
  bankAccountInfo: text("bank_account_info"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
