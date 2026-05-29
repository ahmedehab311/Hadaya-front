import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db, ordersTable, orderItemsTable, productsTable, settingsTable, activityLogTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items, paymentMethod, customerName, customerPhone, customerEmail, notes, isGift, recipientAddress, recipientCity } = parsed.data;

  const [settings] = await db.select().from(settingsTable).limit(1);
  const deliveryFee = settings ? Number(settings.deliveryFeeDefault) : 25;

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    const itemSubtotal = Number(product.price) * item.quantity;
    subtotal += itemSubtotal;
    orderItemsData.push({
      productId: product.id,
      productNameAr: product.nameAr,
      productNameEn: product.nameEn,
      productImageUrl: product.imageUrl,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: itemSubtotal.toString(),
    });
  }

  const total = subtotal + deliveryFee;
  const giftToken = isGift ? crypto.randomBytes(16).toString("hex") : null;

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: customerName ?? null,
      customerPhone: customerPhone ?? null,
      customerEmail: customerEmail ?? null,
      status: "pending",
      paymentMethod,
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      total: total.toString(),
      notes: notes ?? null,
      isGift: isGift ?? false,
      giftToken,
      recipientAddress: recipientAddress ?? null,
      recipientCity: recipientCity ?? null,
    })
    .returning();

  const insertedItems = await db
    .insert(orderItemsTable)
    .values(orderItemsData.map((i) => ({ ...i, orderId: order.id })))
    .returning();

  await db.insert(activityLogTable).values({
    type: "order_placed",
    message: `New order #${order.id} placed${customerName ? ` by ${customerName}` : ""}`,
    orderId: order.id,
  });

  res.status(201).json(
    GetOrderResponse.parse({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: insertedItems.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    }),
  );
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

  res.json(
    GetOrderResponse.parse({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    }),
  );
});

export default router;
