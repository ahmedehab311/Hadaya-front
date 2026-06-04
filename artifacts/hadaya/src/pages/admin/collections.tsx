import { useState } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  useListAdminCollections, useCreateCollection, useUpdateCollection, useDeleteCollection,
  getListAdminCollectionsQueryKey,
} from "@workspace/api-client-react";
import type { Collection } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type ColForm = { nameAr: string; nameEn: string; descriptionAr: string; descriptionEn: string; imageUrl: string };
const EMPTY_FORM: ColForm = { nameAr: "", nameEn: "", descriptionAr: "", descriptionEn: "", imageUrl: "" };

export default function AdminCollectionsPage() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ColForm>(EMPTY_FORM);

  const { data: collectionsResponse, isLoading } = useListAdminCollections();
  
  // Unwrap API response that may be wrapped in { data: [...] }
  const collections = Array.isArray(collectionsResponse) ? collectionsResponse : (collectionsResponse as any)?.data ?? [];
  
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  const openCreate = () => { setEditCollection(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (c: Collection) => {
    setEditCollection(c);
    setForm({ nameAr: c.nameAr, nameEn: c.nameEn, descriptionAr: c.descriptionAr ?? "", descriptionEn: c.descriptionEn ?? "", imageUrl: c.imageUrl ?? "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      nameAr: form.nameAr, nameEn: form.nameEn,
      descriptionAr: form.descriptionAr || undefined,
      descriptionEn: form.descriptionEn || undefined,
      imageUrl: form.imageUrl || undefined,
    };
    if (editCollection) {
      updateCollection.mutate({ id: editCollection.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminCollectionsQueryKey() });
          setDialogOpen(false);
          toast({ title: t("تم تحديث المجموعة", "Collection updated") });
        },
      });
    } else {
      createCollection.mutate({ data: data as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminCollectionsQueryKey() });
          setDialogOpen(false);
          toast({ title: t("تم إضافة المجموعة", "Collection created") });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCollection.mutate({ id: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminCollectionsQueryKey() });
        setDeleteId(null);
        toast({ title: t("تم حذف المجموعة", "Collection deleted") });
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-serif text-foreground">{t("إدارة المجموعات", "Collection Management")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{collections?.length ?? 0} {t("مجموعة", "collections")}</p>
          </div>
          <Button onClick={openCreate} className="gap-2" data-testid="button-create-collection">
            <Plus className="w-4 h-4" />
            {t("إضافة مجموعة", "Add Collection")}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections?.map((col) => (
              <div key={col.id} className="bg-card border border-card-border rounded-xl p-4 flex gap-4" data-testid={`card-admin-collection-${col.id}`}>
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {col.imageUrl ? (
                    <img src={col.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Layers className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{lang === "ar" ? col.nameAr : col.nameEn}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{lang === "ar" ? col.descriptionAr : col.descriptionEn}</p>
                  <p className="text-xs text-primary mt-1">{col.productCount} {t("منتج", "products")}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(col)} data-testid={`button-edit-collection-${col.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(col.id)} data-testid={`button-delete-collection-${col.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t("لا توجد مجموعات", "No collections")}</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCollection ? t("تعديل المجموعة", "Edit Collection") : t("إضافة مجموعة", "Add Collection")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("الاسم بالعربي", "Name (AR)")}</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} data-testid="input-col-name-ar" />
              </div>
              <div>
                <Label>{t("الاسم بالإنجليزي", "Name (EN)")}</Label>
                <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} data-testid="input-col-name-en" />
              </div>
            </div>
            <div>
              <Label>{t("رابط الصورة", "Image URL")}</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} data-testid="input-col-image" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("إلغاء", "Cancel")}</Button>
            <Button onClick={handleSave} disabled={createCollection.isPending || updateCollection.isPending} data-testid="button-save-collection">
              {t("حفظ", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("حذف المجموعة", "Delete Collection")}</AlertDialogTitle>
            <AlertDialogDescription>{t("هل أنت متأكد؟", "Are you sure?")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("إلغاء", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" data-testid="button-confirm-delete-col">
              {t("حذف", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
