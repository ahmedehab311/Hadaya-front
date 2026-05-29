import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, collectionsTable, productsTable } from "@workspace/db";
import {
  GetCollectionParams,
  GetCollectionResponse,
  ListCollectionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/collections", async (_req, res): Promise<void> => {
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

  const mapped = rows.map((r) => ({
    ...r,
    productCount: Number(r.productCount),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListCollectionsResponse.parse(mapped));
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCollectionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [col] = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.id, params.data.id));

  if (!col) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  const products = await db
    .select({
      id: productsTable.id,
      nameAr: productsTable.nameAr,
      nameEn: productsTable.nameEn,
      descriptionAr: productsTable.descriptionAr,
      descriptionEn: productsTable.descriptionEn,
      price: productsTable.price,
      imageUrl: productsTable.imageUrl,
      inStock: productsTable.inStock,
      isFeatured: productsTable.isFeatured,
      collectionId: productsTable.collectionId,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .where(eq(productsTable.collectionId, params.data.id))
    .orderBy(productsTable.createdAt);

  res.json(
    GetCollectionResponse.parse({
      ...col,
      createdAt: col.createdAt.toISOString(),
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        collectionName: col.nameEn,
        createdAt: p.createdAt.toISOString(),
      })),
    }),
  );
});

export default router;
