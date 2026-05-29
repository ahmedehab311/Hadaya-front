import { useState } from "react";
import { Search, Eye, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useListAdminOrders, useGetAdminOrder, useUpdateAdminOrder, getListAdminOrdersQueryKey, getGetAdminOrderQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد المعالجة",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي",
};

const PAYMENT_LABELS_AR: Record<string, string> = {
  cash_on_delivery: "الدفع عند الاستلام", bank_transfer: "تحويل بنكي", card: "بطاقة ائتمان",
};
const PAYMENT_LABELS_EN: Record<string, string> = {
  cash_on_delivery: "Cash on Delivery", bank_transfer: "Bank Transfer", card: "Credit Card",
};

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const updateOrder = useUpdateAdminOrder();

  const params = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  };

  const { data: orders, isLoading } = useListAdminOrders(params);
  const { data: selectedOrder } = useGetAdminOrder(selectedOrderId!, {
    query: { enabled: !!selectedOrderId, queryKey: getGetAdminOrderQueryKey(selectedOrderId!) },
  });

  const handleStatusUpdate = (status: string) => {
    if (!selectedOrderId) return;
    updateOrder.mutate(
      { id: selectedOrderId, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey(params) });
          queryClient.invalidateQueries({ queryKey: getGetAdminOrderQueryKey(selectedOrderId) });
          toast({ title: t("تم تحديث الطلب", "Order updated") });
        },
      },
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">{t("إدارة الطلبات", "Order Management")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{orders?.length ?? 0} {t("طلب", "orders")}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("بحث بالاسم أو الجوال...", "Search by name or phone...")}
              className="ps-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-order-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder={t("كل الحالات", "All Statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("كل الحالات", "All Statuses")}</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {lang === "ar" ? STATUS_LABELS_AR[s] : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">{t("العميل", "Customer")}</th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">{t("الإجمالي", "Total")}</th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">{t("الدفع", "Payment")}</th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">{t("الحالة", "Status")}</th>
                  <th className="text-start px-4 py-3 font-medium text-muted-foreground">{t("التاريخ", "Date")}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-testid={`row-order-${order.id}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{order.customerName || t("غير محدد", "N/A")}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone || ""}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">{order.total.toFixed(2)} {t("ر.س", "SAR")}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {lang === "ar" ? PAYMENT_LABELS_AR[order.paymentMethod] : PAYMENT_LABELS_EN[order.paymentMethod]}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {lang === "ar" ? STATUS_LABELS_AR[order.status] : order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedOrderId(order.id); setSheetOpen(true); }}
                          data-testid={`button-view-order-${order.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      {t("لا توجد طلبات", "No orders found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t("تفاصيل الطلب", "Order Details")} #{selectedOrderId}</SheetTitle>
            </SheetHeader>
            {selectedOrder && (
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("العميل", "Customer")}</p>
                    <p className="font-medium">{selectedOrder.customerName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("الجوال", "Phone")}</p>
                    <p className="font-medium">{selectedOrder.customerPhone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("الإجمالي", "Total")}</p>
                    <p className="font-bold text-primary">{selectedOrder.total.toFixed(2)} {t("ر.س", "SAR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("طريقة الدفع", "Payment")}</p>
                    <p className="font-medium">{lang === "ar" ? PAYMENT_LABELS_AR[selectedOrder.paymentMethod] : PAYMENT_LABELS_EN[selectedOrder.paymentMethod]}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">{t("المنتجات", "Items")}</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <img src={item.productImageUrl || "https://placehold.co/40x40/f5e8d8/9b6b52?text=H"} className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0" alt="" />
                        <div className="flex-1">
                          <p className="font-medium">{lang === "ar" ? item.productNameAr : item.productNameEn}</p>
                          <p className="text-muted-foreground text-xs">×{item.quantity} — {item.subtotal.toFixed(2)} {t("ر.س", "SAR")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">{t("تحديث الحالة", "Update Status")}</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={selectedOrder.status === s ? "default" : "outline"}
                        onClick={() => handleStatusUpdate(s)}
                        disabled={updateOrder.isPending}
                        data-testid={`button-status-${s}`}
                        className="text-xs"
                      >
                        {lang === "ar" ? STATUS_LABELS_AR[s] : s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
}
