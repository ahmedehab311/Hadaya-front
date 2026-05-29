import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import {
  GetGiftByTokenParams,
  GetGiftByTokenResponse,
  SubmitGiftAddressParams,
  SubmitGiftAddressBody,
  SubmitGiftAddressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gift/:token", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const params = GetGiftByTokenParams.safeParse({ token: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.giftToken, params.data.token));

  if (!order) {
    res.status(404).json({ error: "Gift token not found or expired" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json(
    GetGiftByTokenResponse.parse({
      orderId: order.id,
      senderName: order.customerName,
      message: order.notes,
      isAddressSubmitted: !!order.recipientAddress,
      recipientAddress: order.recipientAddress,
      recipientCity: order.recipientCity,
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    }),
  );
});

router.post("/gift/:token/address", async (req, res): Promise<void> => {
  const rawToken = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const params = SubmitGiftAddressParams.safeParse({ token: rawToken });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SubmitGiftAddressBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.giftToken, params.data.token));

  if (!order) {
    res.status(404).json({ error: "Gift token not found or expired" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ recipientAddress: body.data.recipientAddress, recipientCity: body.data.recipientCity })
    .where(eq(ordersTable.id, order.id))
    .returning();

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json(
    SubmitGiftAddressResponse.parse({
      orderId: updated.id,
      senderName: updated.customerName,
      message: updated.notes,
      isAddressSubmitted: !!updated.recipientAddress,
      recipientAddress: updated.recipientAddress,
      recipientCity: updated.recipientCity,
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    }),
  );
});

export default router;
