import { useState } from "react";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  useListAdminProducts, useListAdminCollections,
  useCreateProduct, useUpdateProduct, useDeleteProduct,
  getListAdminProductsQueryKey,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type ProductForm = {
  nameAr: string; nameEn: string; descriptionAr: string; descriptionEn: string;
  price: string; imageUrl: string; inStock: boolean; isFeatured: boolean; collectionId: string;
};

const EMPTY_FORM: ProductForm = {
  nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "",
  price: "", imageUrl: "", inStock: true, isFeatured: false, collectionId: "",
};

function productToForm(p: Product): ProductForm {
  return {
    nameAr: p.nameAr, nameEn: p.nameEn,
    descriptionAr: p.descriptionAr ?? "", descriptionEn: p.descriptionEn ?? "",
    price: Number(p.price).toString(), imageUrl: p.imageUrl,
    inStock: p.inStock, isFeatured: p.isFeatured,
    collectionId: p.collectionId?.toString() ?? "",
  };
}

export default function AdminProductsPage() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const { data: productsResponse, isLoading } = useListAdminProducts();
  const { data: collectionsResponse } = useListAdminCollections();
  
  // Unwrap API responses that may be wrapped in { data: [...] }
  const products = Array.isArray(productsResponse) ? productsResponse : (productsResponse as any)?.data ?? [];
  const collections = Array.isArray(collectionsResponse) ? collectionsResponse : (collectionsResponse as any)?.data ?? [];
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const openCreate = () => { setEditProduct(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setForm(productToForm(p)); setDialogOpen(true); };

  const handleSave = () => {
    const data = {
      nameAr: form.nameAr, nameEn: form.nameEn,
      descriptionAr: form.descriptionAr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      price: parseFloat(form.price),
      imageUrl: form.imageUrl,
      inStock: form.inStock, isFeatured: form.isFeatured,
      collectionId: form.collectionId ? parseInt(form.collectionId) : null,
    };

    if (editProduct) {
      updateProduct.mutate({ id: editProduct.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
          setDialogOpen(false);
          toast({ title: t("تم تحديث المنتج", "Product updated") });
        },
      });
    } else {
      createProduct.mutate({ data: data as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
          setDialogOpen(false);
          toast({ title: t("تم إضافة المنتج", "Product created") });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
        setDeleteId(null);
        toast({ title: t("تم حذف المنتج", "Product deleted") });
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-serif text-foreground">{t("إدارة المنتجات", "Product Management")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{products?.length ?? 0} {t("منتج", "products")}</p>
          </div>
          <Button onClick={openCreate} className="gap-2" data-testid="button-create-product">
            <Plus className="w-4 h-4" />
            {t("إضافة منتج", "Add Product")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="bg-card border border-card-border rounded-xl p-4 flex gap-3" data-testid={`card-admin-product-${product.id}`}>
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{lang === "ar" ? product.nameAr : product.nameEn}</p>
                  <p className="text-primary font-bold text-sm">{Number(product.price).toFixed(2)} {t("ر.س", "SAR")}</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {product.isFeatured && <Badge variant="secondary" className="text-xs">{t("مميز", "Featured")}</Badge>}
                    {!product.inStock && <Badge variant="destructive" className="text-xs">{t("نفد", "Out")}</Badge>}
                    {product.collectionName && <Badge variant="outline" className="text-xs">{product.collectionName}</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)} data-testid={`button-edit-product-${product.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(product.id)} data-testid={`button-delete-product-${product.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">{t("لا توجد منتجات", "No products")}</div>
          )}
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? t("تعديل المنتج", "Edit Product") : t("إضافة منتج", "Add Product")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("الاسم بالعربي", "Name (AR)")}</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} data-testid="input-product-name-ar" />
              </div>
              <div>
                <Label>{t("الاسم بالإنجليزي", "Name (EN)")}</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} data-testid="input-product-name-en" />
              </div>
            </div>
            <div>
              <Label>{t("السعر", "Price (SAR)")}</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="input-product-price" />
            </div>
            <div>
              <Label>{t("رابط الصورة", "Image URL")}</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} data-testid="input-product-image" />
            </div>
            <div>
              <Label>{t("المجموعة", "Collection")}</Label>
              <Select value={form.collectionId || "none"} onValueChange={(v) => setForm({ ...form, collectionId: v === "none" ? "" : v })}>
                <SelectTrigger data-testid="select-product-collection">
                  <SelectValue placeholder={t("بدون مجموعة", "No collection")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("بدون مجموعة", "No collection")}</SelectItem>
                  {collections?.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" ? c.nameAr : c.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.inStock} onCheckedChange={(v) => setForm({ ...form, inStock: v })} data-testid="switch-in-stock" />
                <Label>{t("متوفر", "In Stock")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} data-testid="switch-featured" />
                <Label>{t("مميز", "Featured")}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-product">{t("إلغاء", "Cancel")}</Button>
            <Button onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending} data-testid="button-save-product">
              {t("حفظ", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("حذف المنتج", "Delete Product")}</AlertDialogTitle>
            <AlertDialogDescription>{t("هل أنت متأكد من حذف هذا المنتج؟", "Are you sure you want to delete this product?")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t("إلغاء", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" data-testid="button-confirm-delete">
              {t("حذف", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
