import { useParams, Link } from "wouter";
import { CheckCircle, Clock, Package, Truck, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", ar: "قيد الانتظار", en: "Pending" },
  confirmed: { icon: CheckCircle, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", ar: "مؤكد", en: "Confirmed" },
  processing: { icon: Package, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", ar: "قيد المعالجة", en: "Processing" },
  shipped: { icon: Truck, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", ar: "تم الشحن", en: "Shipped" },
  delivered: { icon: CheckCircle, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", ar: "تم التسليم", en: "Delivered" },
  cancelled: { icon: XCircle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", ar: "ملغي", en: "Cancelled" },
};

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, isRTL } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const orderId = parseInt(id, 10);
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  const statusConfig = order ? STATUS_CONFIG[order.status] : null;
  const StatusIcon = statusConfig?.icon ?? Clock;

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : order ? (
          <>
            <div className="text-center mb-10">
              <div className={`inline-flex w-20 h-20 rounded-full items-center justify-center mb-4 ${statusConfig?.color}`}>
                <StatusIcon className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-foreground mb-1">
                {t("الطلب رقم", "Order #")}{order.id}
              </h1>
              <Badge className={`${statusConfig?.color} border-0`}>
                {lang === "ar" ? statusConfig?.ar : statusConfig?.en}
              </Badge>
              <p className="text-muted-foreground text-sm mt-2">
                {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-4">{t("المنتجات", "Items")}</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3" data-testid={`order-item-${item.id}`}>
                    <img
                      src={item.productImageUrl || "https://placehold.co/60x60/f5e8d8/9b6b52?text=H"}
                      alt={lang === "ar" ? item.productNameAr : item.productNameEn}
                      className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{lang === "ar" ? item.productNameAr : item.productNameEn}</p>
                      <p className="text-xs text-muted-foreground">{t("الكمية:", "Qty:")} {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{item.subtotal.toFixed(2)} {t("ر.س", "SAR")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6 mb-6">
              <h2 className="font-semibold mb-4">{t("ملخص الطلب", "Order Summary")}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                  <span>{order.subtotal.toFixed(2)} {t("ر.س", "SAR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                  <span>{order.deliveryFee.toFixed(2)} {t("ر.س", "SAR")}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-border pt-2 mt-2">
                  <span>{t("الإجمالي", "Total")}</span>
                  <span className="text-primary">{order.total.toFixed(2)} {t("ر.س", "SAR")}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="gap-2" data-testid="button-back-home">
                  <BackArrow className="w-4 h-4" />
                  {t("الرئيسية", "Home")}
                </Button>
              </Link>
              <Link href="/products">
                <Button className="flex-1" data-testid="button-continue-shopping">
                  {t("مواصلة التسوق", "Continue Shopping")}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            {t("الطلب غير موجود", "Order not found")}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
