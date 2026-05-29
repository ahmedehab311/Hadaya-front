import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable, collectionsTable } from "@workspace/db";
import {
  GetAdminProductParams,
  GetAdminProductResponse,
  CreateProductBody,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
  ListAdminProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function fetchProductWithCollection(id: number) {
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
    .where(eq(productsTable.id, id));
  return row;
}

router.get("/admin/products", async (_req, res): Promise<void> => {
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
    .orderBy(productsTable.createdAt);

  res.json(ListAdminProductsResponse.parse(rows.map((r) => ({ ...r, price: Number(r.price), createdAt: r.createdAt.toISOString() }))));
});

router.post("/admin/products", async (req, res): Promise<void> => {
  const body = CreateProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      nameAr: body.data.nameAr,
      nameEn: body.data.nameEn,
      descriptionAr: body.data.descriptionAr ?? null,
      descriptionEn: body.data.descriptionEn ?? null,
      price: body.data.price.toString(),
      imageUrl: body.data.imageUrl,
      inStock: body.data.inStock ?? true,
      isFeatured: body.data.isFeatured ?? false,
      collectionId: body.data.collectionId ?? null,
    })
    .returning();

  const row = await fetchProductWithCollection(product.id);
  res.status(201).json(GetAdminProductResponse.parse({ ...row!, price: Number(row!.price), createdAt: row!.createdAt.toISOString() }));
});

router.get("/admin/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAdminProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const row = await fetchProductWithCollection(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetAdminProductResponse.parse({ ...row, price: Number(row.price), createdAt: row.createdAt.toISOString() }));
});

router.patch("/admin/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProductParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (body.data.nameAr !== undefined) updateData.nameAr = body.data.nameAr;
  if (body.data.nameEn !== undefined) updateData.nameEn = body.data.nameEn;
  if (body.data.descriptionAr !== undefined) updateData.descriptionAr = body.data.descriptionAr;
  if (body.data.descriptionEn !== undefined) updateData.descriptionEn = body.data.descriptionEn;
  if (body.data.price !== undefined) updateData.price = body.data.price.toString();
  if (body.data.imageUrl !== undefined) updateData.imageUrl = body.data.imageUrl;
  if (body.data.inStock !== undefined) updateData.inStock = body.data.inStock;
  if (body.data.isFeatured !== undefined) updateData.isFeatured = body.data.isFeatured;
  if (body.data.collectionId !== undefined) updateData.collectionId = body.data.collectionId;

  const [updated] = await db
    .update(productsTable)
    .set(updateData as any)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const row = await fetchProductWithCollection(updated.id);
  res.json(UpdateProductResponse.parse({ ...row!, price: Number(row!.price), createdAt: row!.createdAt.toISOString() }));
});

router.delete("/admin/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProductParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
