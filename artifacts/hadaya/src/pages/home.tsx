import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Sparkles, Gift, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useGetFeaturedProducts, useListCollections } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLayout } from "@/components/store-layout";

function HeroSection() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-start">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("هدايا مميزة لكل مناسبة", "Curated Gifts for Every Occasion")}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-foreground leading-tight mb-6">
            {t("اهدِ لحظاتٍ", "Gift")} <br />
            <span className="text-primary">{t("لا تُنسى", "Unforgettable")}</span>
            <br />
            {t("", "Moments")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            {t(
              "اكتشف أجمل الهدايا المختارة بعناية، مثالية لكل مناسبة وكل شخص تحبه.",
              "Discover beautifully curated gifts, perfect for every occasion and everyone you love."
            )}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link href="/products">
              <Button size="lg" className="gap-2" data-testid="button-shop-now">
                {t("تسوق الآن", "Shop Now")}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/collections">
              <Button size="lg" variant="outline" data-testid="button-view-collections">
                {t("استعرض المجموعات", "View Collections")}
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4 p-8">
              {[
                { bg: "bg-primary/10", icon: "🎁" },
                { bg: "bg-accent/10", icon: "✨" },
                { bg: "bg-secondary/20", icon: "💝" },
                { bg: "bg-primary/5", icon: "🌹" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`${item.bg} rounded-2xl aspect-square flex items-center justify-center text-4xl shadow-sm border border-border/30`}
                >
                  {item.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Sparkles, ar: "هدايا مختارة بعناية", en: "Carefully Curated Gifts", desc: { ar: "كل منتج مختار بذوق رفيع", en: "Every product selected with fine taste" } },
          { icon: Gift, ar: "تغليف فاخر", en: "Luxury Packaging", desc: { ar: "يصل هديتك بشكل مميز", en: "Your gift arrives beautifully presented" } },
          { icon: Truck, ar: "توصيل سريع", en: "Fast Delivery", desc: { ar: "توصيل لجميع مناطق المملكة", en: "Delivery across all regions" } },
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="bg-card border border-card-border rounded-xl p-5 flex gap-4 items-start">
              <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.ar && feature.en ? (window.document.documentElement.lang === "ar" ? feature.ar : feature.en) : feature.ar}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{window.document.documentElement.lang === "ar" ? feature.desc.ar : feature.desc.en}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: collections, isLoading: loadingCollections } = useListCollections();

  return (
    <StoreLayout>
      <HeroSection />

      {/* Featured Products */}
      {/* <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            {t("المنتجات المميزة", "Featured Products")}
          </h2>
          <Link href="/products">
            <Button variant="ghost" className="gap-1.5 text-primary" data-testid="link-all-products">
              {t("عرض الكل", "View All")}
              <Arrow className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured?.slice(0, 8)?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {t("لا توجد منتجات مميزة حالياً", "No featured products yet")}
          </div>
        )}
      </section> */}
{/* Featured Products */}
<section className="max-w-7xl mx-auto px-4 py-16">
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
      {t("المنتجات المميزة", "Featured Products")}
    </h2>
    <Link href="/products">
      <Button variant="ghost" className="gap-1.5 text-primary" data-testid="link-all-products">
        {t("عرض الكل", "View All")}
        <Arrow className="w-4 h-4" />
      </Button>
    </Link>
  </div>

  {loadingFeatured ? (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  ) : Array.isArray(featured) && featured.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {featured.slice(0, 8).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  ) : featured && typeof featured === "object" && Array.isArray((featured as any).products) && (featured as any).products.length > 0 ? (
    // الـ Fallback ده تحسباً لو الـ API بيرجع البيانات جوة داتا بروبيرتي اسمها products
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(featured as any).products.slice(0, 8).map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  ) : (
    <div className="text-center py-12 text-muted-foreground">
      {t("لا توجد منتجات مميزة حالياً", "No featured products yet")}
    </div>
  )}
</section>
      {/* Collections */}
      {/* <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              {t("المجموعات", "Collections")}
            </h2>
            <Link href="/collections">
              <Button variant="ghost" className="gap-1.5 text-primary" data-testid="link-all-collections">
                {t("عرض الكل", "View All")}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingCollections ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : collections && collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.slice(0, 3).map((col) => (
                <Link key={col.id} href={`/collections/${col.id}`}>
                  <div
                    className="group relative bg-card border border-card-border rounded-2xl overflow-hidden h-48 cursor-pointer hover:shadow-lg transition-all"
                    data-testid={`card-collection-${col.id}`}
                  >
                    {col.imageUrl ? (
                      <img
                        src={col.imageUrl}
                        alt={window.document.documentElement.lang === "ar" ? col.nameAr : col.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute bottom-0 start-0 p-5">
                      <h3 className="text-white font-bold text-lg font-serif">
                        {window.document.documentElement.lang === "ar" ? col.nameAr : col.nameEn}
                      </h3>
                      <p className="text-white/80 text-sm">{col.productCount} {t("منتج", "products")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t("لا توجد مجموعات حالياً", "No collections yet")}
            </div>
          )}
        </div>
      </section> */}
      {/* Collections */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              {t("المجموعات", "Collections")}
            </h2>
            <Link href="/collections">
              <Button variant="ghost" className="gap-1.5 text-primary" data-testid="link-all-collections">
                {t("عرض الكل", "View All")}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loadingCollections ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : Array.isArray(collections) && collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.slice(0, 3).map((col) => (
                <Link key={col.id} href={`/collections/${col.id}`}>
                  <div
                    className="group relative bg-card border border-card-border rounded-2xl overflow-hidden h-48 cursor-pointer hover:shadow-lg transition-all"
                    data-testid={`card-collection-${col.id}`}
                  >
                    {col.imageUrl ? (
                      <img
                        src={col.imageUrl}
                        alt={window.document.documentElement.lang === "ar" ? col.nameAr : col.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute bottom-0 start-0 p-5">
                      <h3 className="text-white font-bold text-lg font-serif">
                        {window.document.documentElement.lang === "ar" ? col.nameAr : col.nameEn}
                      </h3>
                      <p className="text-white/80 text-sm">{col.productCount} {t("منتج", "products")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : collections && typeof collections === "object" && Array.isArray((collections as any).collections) && (collections as any).collections.length > 0 ? (
            // Fallback تحسباً لو الـ API لافف الـ array جوة object وباسمه collections
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(collections as any).collections.slice(0, 3).map((col: any) => (
                <Link key={col.id} href={`/collections/${col.id}`}>
                  <div className="group relative bg-card border border-card-border rounded-2xl overflow-hidden h-48 cursor-pointer hover:shadow-lg transition-all">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute bottom-0 start-0 p-5">
                      <h3 className="text-white font-bold text-lg font-serif">
                        {window.document.documentElement.lang === "ar" ? col.nameAr : col.nameEn}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t("لا توجد مجموعات حالياً", "No collections yet")}
            </div>
          )}
        </div>
      </section>
    </StoreLayout>
  );
}
