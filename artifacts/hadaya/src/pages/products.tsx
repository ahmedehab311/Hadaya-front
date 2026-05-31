import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useListProducts, useListCollections } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { StoreLayout } from "@/components/store-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_PRODUCTS, MOCK_COLLECTIONS } from "@/data/mock-data";

export default function ProductsPage() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);

  const { data: productsApi, isLoading } = useListProducts({
    collectionId: selectedCollection ?? undefined,
    search: search || undefined,
  });
  const { data: collectionsApi } = useListCollections();

  // استخدم الـ API data لو موجودة، وإلا الـ mock — لكن بس لو مفيش فلتر/سيرش مطبق
  const hasFilter = !!search || selectedCollection !== null;
  const collections = collectionsApi && collectionsApi.length > 0 ? collectionsApi : MOCK_COLLECTIONS;

  let products = productsApi ?? [];
  if (!isLoading && products.length === 0 && !hasFilter) {
    // مفيش بيانات من الـ API ومفيش فلتر → اعرض الـ mock
    products = MOCK_PRODUCTS;
  } else if (!isLoading && products.length === 0 && hasFilter) {
    // في فلتر لكن ما لقاش نتايج → لا تعرض mock، اعرض "لا توجد نتائج"
    products = [];
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-8">
          {t("جميع المنتجات", "All Products")}
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("بحث عن منتج...", "Search products...")}
              className="ps-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedCollection === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCollection(null)}
              data-testid="filter-all"
            >
              {t("الكل", "All")}
            </Button>
            {collections.map((col) => (
              <Button
                key={col.id}
                variant={selectedCollection === col.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCollection(col.id === selectedCollection ? null : col.id)}
                data-testid={`filter-collection-${col.id}`}
              >
                {lang === "ar" ? col.nameAr : col.nameEn}
                <Badge variant="secondary" className="ms-1.5 text-xs">{col.productCount ?? 0}</Badge>
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {products.length} {t("منتج", "products")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t("لا توجد منتجات", "No products found")}</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
