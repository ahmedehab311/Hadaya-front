import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useGetCollection, getGetCollectionQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, isRTL } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const colId = parseInt(id, 10);
  const { data: collection, isLoading } = useGetCollection(colId, {
    query: { enabled: !!colId, queryKey: getGetCollectionQueryKey(colId) },
  });

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/collections">
          <Button variant="ghost" className="gap-2 mb-6 -ms-2" data-testid="button-back">
            <BackArrow className="w-4 h-4" />
            {t("المجموعات", "Collections")}
          </Button>
        </Link>

        {isLoading ? (
          <div>
            <Skeleton className="h-10 w-56 mb-4" />
            <Skeleton className="h-5 w-96 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
            </div>
          </div>
        ) : collection ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-serif text-foreground mb-2">
                {lang === "ar" ? collection.nameAr : collection.nameEn}
              </h1>
              {(lang === "ar" ? collection.descriptionAr : collection.descriptionEn) && (
                <p className="text-muted-foreground">
                  {lang === "ar" ? collection.descriptionAr : collection.descriptionEn}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {collection.products.length} {t("منتج", "products")}
              </p>
            </div>

            {collection.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collection.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                {t("لا توجد منتجات في هذه المجموعة", "No products in this collection")}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            {t("المجموعة غير موجودة", "Collection not found")}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
