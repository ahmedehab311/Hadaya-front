import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { useGetSettings } from "@workspace/api-client-react";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { t, lang, isRTL } = useLanguage();
  const { items, removeItem, updateQty, subtotal } = useCart();
  const { data: settings } = useGetSettings();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const deliveryFee = settings ? settings.deliveryFee : 25;
  const total = subtotal + deliveryFee;

  return (
    <StoreLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-8" data-testid="text-cart-title">
          {t("سلة التسوق", "Shopping Cart")}
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("السلة فارغة", "Your cart is empty")}</h2>
            <p className="text-muted-foreground mb-6">{t("ابدأ التسوق واكتشف هداياناً المميزة", "Start shopping and discover our curated gifts")}</p>
            <Link href="/products">
              <Button className="gap-2" data-testid="button-start-shopping">
                {t("تسوق الآن", "Shop Now")}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-card border border-card-border rounded-xl p-4 flex gap-4"
                  data-testid={`cart-item-${item.productId}`}
                >
                  <img
                    src={item.imageUrl || "https://placehold.co/100x100/f5e8d8/9b6b52?text=H"}
                    alt={lang === "ar" ? item.nameAr : item.nameEn}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {lang === "ar" ? item.nameAr : item.nameEn}
                    </h3>
                    <p className="text-primary font-bold mt-1" data-testid={`text-item-price-${item.productId}`}>
                      {item.price.toFixed(2)} {t("ر.س", "SAR")}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          className="p-1.5 hover:bg-muted transition-colors"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium" data-testid={`text-item-qty-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <button
                          className="p-1.5 hover:bg-muted transition-colors"
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        className="text-destructive hover:text-destructive/80 transition-colors p-1.5"
                        onClick={() => removeItem(item.productId)}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="font-bold text-foreground" data-testid={`text-item-subtotal-${item.productId}`}>
                      {(item.price * item.quantity).toFixed(2)} {t("ر.س", "SAR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:w-80 shrink-0">
              <div className="bg-card border border-card-border rounded-xl p-6 sticky top-24">
                <h2 className="font-bold text-lg text-foreground mb-4">{t("ملخص الطلب", "Order Summary")}</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                    <span data-testid="text-subtotal">{subtotal.toFixed(2)} {t("ر.س", "SAR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("رسوم التوصيل", "Delivery Fee")}</span>
                    <span>{deliveryFee.toFixed(2)} {t("ر.س", "SAR")}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>{t("الإجمالي", "Total")}</span>
                    <span className="text-primary" data-testid="text-total">{total.toFixed(2)} {t("ر.س", "SAR")}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="w-full mt-6 gap-2" size="lg" data-testid="button-checkout">
                    {t("إتمام الطلب", "Proceed to Checkout")}
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" className="w-full mt-2" data-testid="button-continue-shopping">
                    {t("مواصلة التسوق", "Continue Shopping")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
