import { useParams, Link } from "wouter";
import { ArrowLeft, ArrowRight, ShoppingCart, CheckCircle, Package } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/contexts/cart-context";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, isRTL } = useLanguage();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const productId = parseInt(id, 10);
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  });

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/products">
          <Button variant="ghost" className="gap-2 mb-6 -ms-2" data-testid="button-back">
            <BackArrow className="w-4 h-4" />
            {t("العودة للمنتجات", "Back to Products")}
          </Button>
        </Link>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.imageUrl || "https://placehold.co/600x600/f5e8d8/9b6b52?text=Hadaya"}
                alt={lang === "ar" ? product.nameAr : product.nameEn}
                className="w-full h-full object-cover"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    {t("نفدت الكمية", "Out of Stock")}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {product.collectionName && (
                <Link href="/collections">
                  <Badge variant="secondary" className="w-fit">{product.collectionName}</Badge>
                </Link>
              )}
              <h1 className="text-3xl font-bold font-serif text-foreground">
                {lang === "ar" ? product.nameAr : product.nameEn}
              </h1>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                  {Number(product.price).toFixed(2)}
                </span>
                <span className="text-muted-foreground">{t("ر.س", "SAR")}</span>
              </div>

              {(lang === "ar" ? product.descriptionAr : product.descriptionEn) && (
                <p className="text-muted-foreground leading-relaxed">
                  {lang === "ar" ? product.descriptionAr : product.descriptionEn}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                <span className={product.inStock ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                  {product.inStock ? t("متوفر في المخزون", "In Stock") : t("نفدت الكمية", "Out of Stock")}
                </span>
              </div>

              {product.inStock && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      className="px-3 py-2 hover:bg-muted transition-colors"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      data-testid="button-qty-minus"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium text-sm" data-testid="text-qty">{qty}</span>
                    <button
                      className="px-3 py-2 hover:bg-muted transition-colors"
                      onClick={() => setQty((q) => q + 1)}
                      data-testid="button-qty-plus"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    {added ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t("تمت الإضافة", "Added!")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {t("أضف للسلة", "Add to Cart")}
                      </>
                    )}
                  </Button>
                </div>
              )}

              <Link href="/cart">
                <Button variant="outline" className="w-full" data-testid="button-go-to-cart">
                  {t("عرض السلة", "View Cart")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            {t("المنتج غير موجود", "Product not found")}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
