import { Router, type IRouter } from "express";
import { count, sum, eq, gte } from "drizzle-orm";
import { db, ordersTable, productsTable, collectionsTable, activityLogTable } from "@workspace/db";
import {
  GetAdminDashboardStatsResponse,
  GetOrderStatusBreakdownResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/dashboard/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalOrders: count(ordersTable.id),
      totalRevenue: sum(ordersTable.total),
    })
    .from(ordersTable);

  const [pendingCount] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));

  const [processingCount] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "processing"));

  const [deliveredCount] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"));

  const [cancelledCount] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "cancelled"));

  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [collectionCount] = await db.select({ count: count() }).from(collectionsTable);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayStats] = await db
    .select({
      ordersToday: count(ordersTable.id),
      revenueToday: sum(ordersTable.total),
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));

  res.json(
    GetAdminDashboardStatsResponse.parse({
      totalOrders: totals?.totalOrders ?? 0,
      totalRevenue: Number(totals?.totalRevenue ?? 0),
      pendingOrders: pendingCount?.count ?? 0,
      processingOrders: processingCount?.count ?? 0,
      deliveredOrders: deliveredCount?.count ?? 0,
      cancelledOrders: cancelledCount?.count ?? 0,
      totalProducts: productCount?.count ?? 0,
      totalCollections: collectionCount?.count ?? 0,
      ordersToday: todayStats?.ordersToday ?? 0,
      revenueToday: Number(todayStats?.revenueToday ?? 0),
    }),
  );
});

router.get("/admin/dashboard/order-status-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ status: ordersTable.status, count: count() })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  res.json(GetOrderStatusBreakdownResponse.parse(rows.map((r) => ({ status: r.status, count: r.count }))));
});

router.get("/admin/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityLogTable)
    .orderBy(activityLogTable.createdAt)
    .limit(20);

  res.json(
    GetRecentActivityResponse.parse(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    ),
  );
});

export default router;
