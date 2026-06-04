import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useListMenu } from "@workspace/api-client-react";
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

  const { data: menuResponse, isLoading, isError } = useListMenu();

  // الـ API response يحتوي على الـ data في property
  const menuData = Array.isArray(menuResponse) ? menuResponse : (menuResponse as any)?.data ?? [];
  
  // عرض API data عند النجاح، عرض mock فقط عند الخطأ
  const collections = isError ? MOCK_COLLECTIONS : menuData;
  
  // استخراج الـ products من الـ menu بناءً على الـ selected collection والـ search
  const products = useMemo(() => {
    if (!menuData) return [];
    
    let allProducts = selectedCollection === null
      ? menuData.flatMap((col: any) => col.products)
      : menuData.find((col: any) => col.id === selectedCollection)?.products ?? [];
    
    // تطبيق الـ search filter
    if (search) {
      allProducts = allProducts.filter((p: any) => 
        p.nameAr.toLowerCase().includes(search.toLowerCase()) || 
        p.nameEn.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return allProducts;
  }, [menuData, selectedCollection, search]);

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
            {collections?.map((col) => (
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
