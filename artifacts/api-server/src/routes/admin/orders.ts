import { Router, type IRouter } from "express";
import { eq, and, gte, lte, ilike, or } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, activityLogTable } from "@workspace/db";
import {
  ListAdminOrdersQueryParams,
  GetAdminOrderParams,
  GetAdminOrderResponse,
  UpdateAdminOrderParams,
  UpdateAdminOrderBody,
  UpdateAdminOrderResponse,
  ListAdminOrdersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/orders", async (req, res): Promise<void> => {
  const parsed = ListAdminOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, paymentMethod, dateFrom, dateTo, search } = parsed.data;
  const conditions = [];

  if (status) conditions.push(eq(ordersTable.status, status as any));
  if (paymentMethod) conditions.push(eq(ordersTable.paymentMethod, paymentMethod as any));
  if (dateFrom) conditions.push(gte(ordersTable.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(ordersTable.createdAt, new Date(dateTo)));
  if (search) {
    conditions.push(
      or(
        ilike(ordersTable.customerName, `%${search}%`),
        ilike(ordersTable.customerPhone, `%${search}%`),
        ilike(ordersTable.customerEmail, `%${search}%`),
      )!,
    );
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(ordersTable.createdAt);

  const withItems = await Promise.all(
    orders.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      return {
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
      };
    }),
  );

  res.json(ListAdminOrdersResponse.parse(withItems));
});

router.get("/admin/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAdminOrderParams.safeParse({ id: parseInt(raw, 10) });
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
    GetAdminOrderResponse.parse({
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

router.patch("/admin/orders/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateAdminOrderParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateAdminOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.data.status) updateData.status = body.data.status;
  if (body.data.notes !== undefined) updateData.notes = body.data.notes;
  if (body.data.recipientAddress !== undefined) updateData.recipientAddress = body.data.recipientAddress;
  if (body.data.recipientCity !== undefined) updateData.recipientCity = body.data.recipientCity;

  const [order] = await db
    .update(ordersTable)
    .set(updateData as any)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (body.data.status) {
    const activityTypeMap: Record<string, string> = {
      confirmed: "order_confirmed",
      shipped: "order_shipped",
      delivered: "order_delivered",
      cancelled: "order_cancelled",
    };
    const actType = activityTypeMap[body.data.status];
    if (actType) {
      await db.insert(activityLogTable).values({
        type: actType as any,
        message: `Order #${order.id} marked as ${body.data.status}`,
        orderId: order.id,
      });
    }
  }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

  res.json(
    UpdateAdminOrderResponse.parse({
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
