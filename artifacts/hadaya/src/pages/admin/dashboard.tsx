import { ShoppingBag, Package, TrendingUp, AlertCircle, CheckCircle, Truck, XCircle, Clock, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  useGetAdminDashboardStats,
  useGetOrderStatusBreakdown,
  useGetRecentActivity,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  order_placed: ShoppingBag,
  order_confirmed: CheckCircle,
  order_shipped: Truck,
  order_delivered: CheckCircle,
  order_cancelled: XCircle,
};

export default function AdminDashboardPage() {
  const { t, lang } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useGetAdminDashboardStats();
  const { data: breakdown } = useGetOrderStatusBreakdown();
  const { data: activity } = useGetRecentActivity();

  const pieData = breakdown?.map((b) => ({
    name: lang === "ar" ? (STATUS_LABELS_AR[b.status] ?? b.status) : b.status,
    value: b.count,
    color: STATUS_COLORS[b.status] ?? "#94a3b8",
  })) ?? [];

  const statCards = stats ? [
    { icon: ShoppingBag, label: t("إجمالي الطلبات", "Total Orders"), value: stats.totalOrders, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
    { icon: TrendingUp, label: t("إجمالي الإيرادات", "Total Revenue"), value: `${stats.totalRevenue.toFixed(2)} ${t("ر.س", "SAR")}`, color: "text-green-500 bg-green-50 dark:bg-green-950/30" },
    { icon: Clock, label: t("طلبات قيد الانتظار", "Pending Orders"), value: stats.pendingOrders, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
    { icon: Activity, label: t("طلبات اليوم", "Orders Today"), value: stats.ordersToday, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30" },
    { icon: Package, label: t("المنتجات", "Products"), value: stats.totalProducts, color: "text-primary bg-primary/10" },
    { icon: AlertCircle, label: t("تم التسليم", "Delivered"), value: stats.deliveredOrders, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30" },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">{t("لوحة التحكم", "Dashboard")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("نظرة عامة على أداء المتجر", "Overview of store performance")}</p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-card border border-card-border rounded-xl p-5" data-testid={`stat-card-${i}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg shrink-0 ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Chart */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-semibold mb-5">{t("توزيع حالات الطلبات", "Order Status Breakdown")}</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, t("طلب", "orders")]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                {t("لا توجد بيانات", "No data yet")}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-semibold mb-5">{t("آخر الأنشطة", "Recent Activity")}</h2>
            {activity && activity.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[...activity].reverse().map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type] ?? Activity;
                  return (
                    <div key={item.id} className="flex items-start gap-3" data-testid={`activity-item-${item.id}`}>
                      <div className="p-1.5 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                {t("لا توجد أنشطة حالياً", "No activity yet")}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
