import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, productsTable, collectionsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
  GetProductResponse,
  ListProductsResponse,
  GetFeaturedProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { collectionId, search, featured } = parsed.data;

  const conditions = [];
  if (collectionId != null) conditions.push(eq(productsTable.collectionId, collectionId));
  if (featured === true) conditions.push(eq(productsTable.isFeatured, true));
  if (search) conditions.push(ilike(productsTable.nameEn, `%${search}%`));

  const rows = await db
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
      collectionName: collectionsTable.nameEn,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(collectionsTable, eq(productsTable.collectionId, collectionsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  const mapped = rows.map((r) => ({
    ...r,
    price: Number(r.price),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListProductsResponse.parse(mapped));
});

router.get("/products", async (_req, res): Promise<void> => {
  const rows = await db
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
      collectionName: collectionsTable.nameEn,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(collectionsTable, eq(productsTable.collectionId, collectionsTable.id))
    .where(eq(productsTable.isFeatured, true))
    .orderBy(productsTable.createdAt);

  const mapped = rows.map((r) => ({
    ...r,
    price: Number(r.price),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(GetFeaturedProductsResponse.parse(mapped));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
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
      collectionName: collectionsTable.nameEn,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(collectionsTable, eq(productsTable.collectionId, collectionsTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse({ ...row, price: Number(row.price), createdAt: row.createdAt.toISOString() }));
});

export default router;
