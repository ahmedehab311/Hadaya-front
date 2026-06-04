import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";
import { useListMenu } from "@workspace/api-client-react";
import { StoreLayout } from "@/components/store-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_COLLECTIONS } from "@/data/mock-data";

export default function CollectionsPage() {
  const { t, lang } = useLanguage();
  const { data: menuResponse, isLoading, isError } = useListMenu();

  // الـ API response يحتوي على الـ data في property
  const collections = isError ? MOCK_COLLECTIONS : (Array.isArray(menuResponse) ? menuResponse : (menuResponse as any)?.data ?? []);

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-8">
          {t("المجموعات", "Collections")}
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`}>
                <div
                  className="group relative bg-card border border-card-border rounded-2xl overflow-hidden h-56 cursor-pointer hover:shadow-lg transition-all"
                  data-testid={`card-collection-${col.id}`}
                >
                  {col.imageUrl ? (
                    <img
                      src={col.imageUrl}
                      alt={lang === "ar" ? col.nameAr : col.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 start-0 p-6">
                    <h3 className="text-white font-bold text-xl font-serif mb-1">
                      {lang === "ar" ? col.nameAr : col.nameEn}
                    </h3>
                    {(lang === "ar" ? col.descriptionAr : col.descriptionEn) && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {lang === "ar" ? col.descriptionAr : col.descriptionEn}
                      </p>
                    )}
                    <p className="text-white/70 text-xs mt-2">
                      {col.productCount ?? 0} {t("منتج", "products")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
