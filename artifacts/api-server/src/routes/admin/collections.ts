import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, collectionsTable, productsTable } from "@workspace/db";
import {
  CreateCollectionBody,
  UpdateCollectionParams,
  UpdateCollectionBody,
  UpdateCollectionResponse,
  DeleteCollectionParams,
  ListAdminCollectionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/collections", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: collectionsTable.id,
      nameAr: collectionsTable.nameAr,
      nameEn: collectionsTable.nameEn,
      descriptionAr: collectionsTable.descriptionAr,
      descriptionEn: collectionsTable.descriptionEn,
      imageUrl: collectionsTable.imageUrl,
      createdAt: collectionsTable.createdAt,
      productCount: count(productsTable.id),
    })
    .from(collectionsTable)
    .leftJoin(productsTable, eq(productsTable.collectionId, collectionsTable.id))
    .groupBy(collectionsTable.id)
    .orderBy(collectionsTable.createdAt);

  res.json(
    ListAdminCollectionsResponse.parse(
      rows.map((r) => ({ ...r, productCount: Number(r.productCount), createdAt: r.createdAt.toISOString() })),
    ),
  );
});

router.post("/admin/collections", async (req, res): Promise<void> => {
  const body = CreateCollectionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [col] = await db
    .insert(collectionsTable)
    .values({
      nameAr: body.data.nameAr,
      nameEn: body.data.nameEn,
      descriptionAr: body.data.descriptionAr ?? null,
      descriptionEn: body.data.descriptionEn ?? null,
      imageUrl: body.data.imageUrl ?? null,
    })
    .returning();

  res.status(201).json({
    ...col,
    productCount: 0,
    createdAt: col.createdAt.toISOString(),
  });
});

router.patch("/admin/collections/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCollectionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateCollectionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.nameAr !== undefined) updateData.nameAr = body.data.nameAr;
  if (body.data.nameEn !== undefined) updateData.nameEn = body.data.nameEn;
  if (body.data.descriptionAr !== undefined) updateData.descriptionAr = body.data.descriptionAr;
  if (body.data.descriptionEn !== undefined) updateData.descriptionEn = body.data.descriptionEn;
  if (body.data.imageUrl !== undefined) updateData.imageUrl = body.data.imageUrl;

  const [updated] = await db
    .update(collectionsTable)
    .set(updateData as any)
    .where(eq(collectionsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const [withCount] = await db
    .select({ productCount: count(productsTable.id) })
    .from(productsTable)
    .where(eq(productsTable.collectionId, updated.id));

  res.json(
    UpdateCollectionResponse.parse({
      ...updated,
      productCount: Number(withCount?.productCount ?? 0),
      createdAt: updated.createdAt.toISOString(),
    }),
  );
});

router.delete("/admin/collections/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCollectionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(collectionsTable).where(eq(collectionsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
