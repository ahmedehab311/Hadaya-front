import { useState, useEffect } from "react";
import { Save, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    storeName: "", storePhone: "", storeEmail: "",
    deliveryFeeDefault: "", deliveryFeeExpress: "",
    deliveryNote: "", bankAccountInfo: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        storeName: settings.storeName,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        deliveryFeeDefault: settings.deliveryFeeDefault.toString(),
        deliveryFeeExpress: settings.deliveryFeeExpress.toString(),
        deliveryNote: settings.deliveryNote ?? "",
        bankAccountInfo: settings.bankAccountInfo ?? "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      {
        data: {
          storeName: form.storeName,
          storePhone: form.storePhone,
          storeEmail: form.storeEmail,
          deliveryFeeDefault: parseFloat(form.deliveryFeeDefault) || 25,
          deliveryFeeExpress: parseFloat(form.deliveryFeeExpress) || 50,
          deliveryNote: form.deliveryNote || undefined,
          bankAccountInfo: form.bankAccountInfo || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: t("تم حفظ الإعدادات", "Settings saved") });
        },
        onError: () => {
          toast({ title: t("حدث خطأ", "An error occurred"), variant: "destructive" });
        },
      },
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">{t("الإعدادات", "Settings")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("إعدادات النظام والمتجر", "System and store configuration")}</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl p-6 space-y-6">
            {/* Store Info */}
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-primary" />
                {t("معلومات المتجر", "Store Information")}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>{t("اسم المتجر", "Store Name")}</Label>
                  <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} data-testid="input-store-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("رقم الجوال", "Phone")}</Label>
                    <Input value={form.storePhone} onChange={(e) => setForm({ ...form, storePhone: e.target.value })} data-testid="input-store-phone" />
                  </div>
                  <div>
                    <Label>{t("البريد الإلكتروني", "Email")}</Label>
                    <Input type="email" value={form.storeEmail} onChange={(e) => setForm({ ...form, storeEmail: e.target.value })} data-testid="input-store-email" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Delivery Fees */}
            <div>
              <h2 className="font-semibold text-foreground mb-4">{t("رسوم التوصيل", "Delivery Fees")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("رسوم التوصيل العادي (ر.س)", "Standard Delivery (SAR)")}</Label>
                  <Input
                    type="number" min="0" step="0.5"
                    value={form.deliveryFeeDefault}
                    onChange={(e) => setForm({ ...form, deliveryFeeDefault: e.target.value })}
                    data-testid="input-delivery-fee"
                  />
                </div>
                <div>
                  <Label>{t("رسوم التوصيل السريع (ر.س)", "Express Delivery (SAR)")}</Label>
                  <Input
                    type="number" min="0" step="0.5"
                    value={form.deliveryFeeExpress}
                    onChange={(e) => setForm({ ...form, deliveryFeeExpress: e.target.value })}
                    data-testid="input-express-fee"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label>{t("ملاحظة التوصيل", "Delivery Note")}</Label>
                <Input value={form.deliveryNote} onChange={(e) => setForm({ ...form, deliveryNote: e.target.value })} placeholder={t("مثال: التوصيل خلال 2-3 أيام عمل", "e.g. Delivery within 2-3 business days")} data-testid="input-delivery-note" />
              </div>
            </div>

            <Separator />

            {/* Bank Account */}
            <div>
              <h2 className="font-semibold text-foreground mb-4">{t("معلومات الحساب البنكي", "Bank Account Info")}</h2>
              <div>
                <Label>{t("تفاصيل الحساب", "Account Details")}</Label>
                <Input
                  value={form.bankAccountInfo}
                  onChange={(e) => setForm({ ...form, bankAccountInfo: e.target.value })}
                  placeholder={t("اسم البنك، رقم IBAN...", "Bank name, IBAN...")}
                  data-testid="input-bank-info"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full gap-2" data-testid="button-save-settings">
              <Save className="w-4 h-4" />
              {updateSettings.isPending ? t("جاري الحفظ...", "Saving...") : t("حفظ الإعدادات", "Save Settings")}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
