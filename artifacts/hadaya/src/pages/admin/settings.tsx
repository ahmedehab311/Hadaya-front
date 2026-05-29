import { useState, useEffect } from "react";
import {
  Save, Settings2, DollarSign, Gift, FileText, Zap, Share2,
  CreditCard, Plus, Trash2, AlertTriangle, Globe, Phone, Mail,
  Smartphone, Link,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type SocialLink = { platform: string; url: string };

const TIMEZONES = [
  "Africa/Cairo", "Africa/Riyadh", "Asia/Riyadh", "Asia/Dubai",
  "Asia/Kuwait", "Asia/Bahrain", "Asia/Qatar", "Asia/Muscat",
  "Asia/Baghdad", "Asia/Amman", "Asia/Beirut", "Africa/Tripoli",
  "Africa/Tunis", "Africa/Algiers", "Africa/Casablanca", "UTC",
];

const LANGUAGES = [
  { value: "ar", label: "العربية (ar)" },
  { value: "en", label: "English (en)" },
];

const emptyForm = {
  // General
  storeNameAr: "هدايا",
  storeNameEn: "Hadaya",
  timezone: "Africa/Cairo",
  defaultLanguage: "ar",
  logoUrl: "",
  faviconUrl: "",
  // Financial
  currencyCode: "SAR",
  currencySymbol: "ر.س",
  deliveryTimeAr: "2-5 أيام عمل",
  deliveryTimeEn: "2-5 business days",
  deliveryFee: "25",
  freeDeliveryThreshold: "200",
  // Gifts
  giftLinkExpiryDays: "7",
  maxGiftMessageLength: "500",
  defaultGiftMessageAr: "",
  defaultGiftMessageEn: "",
  enableGiftWrapping: true,
  wrappingFee: "0",
  greetingCardFee: "0",
  maxRecipientsPerGift: "1",
  // Policies & Contact
  termsAr: "",
  termsEn: "",
  privacyAr: "",
  privacyEn: "",
  returnsAr: "",
  returnsEn: "",
  supportEmail: "",
  phone: "",
  whatsapp: "",
  // System
  maintenanceMode: false,
  acceptNewOrders: true,
  // Payments
  paymentCod: true,
  paymentCreditCard: false,
  paymentVodafone: false,
  paymentVodafoneWallet: "",
  paymentVodafoneInstructions: "",
  paymentInstapay: false,
  paymentInstapayName: "",
  paymentInstapayId: "",
  paymentInstapayInstructions: "",
};

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-2 border-b border-border">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  warning,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  warning?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${warning && checked ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30" : "border-border bg-muted/30"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{label}</span>
          {warning && checked && (
            <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400 gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" /> {/* warning */}
            </Badge>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState(emptyForm);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (!settings) return;
    setForm({
      storeNameAr: settings.storeNameAr,
      storeNameEn: settings.storeNameEn,
      timezone: settings.timezone,
      defaultLanguage: settings.defaultLanguage,
      logoUrl: settings.logoUrl ?? "",
      faviconUrl: settings.faviconUrl ?? "",
      currencyCode: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      deliveryTimeAr: settings.deliveryTimeAr,
      deliveryTimeEn: settings.deliveryTimeEn,
      deliveryFee: String(settings.deliveryFee),
      freeDeliveryThreshold: String(settings.freeDeliveryThreshold),
      giftLinkExpiryDays: String(settings.giftLinkExpiryDays),
      maxGiftMessageLength: String(settings.maxGiftMessageLength),
      defaultGiftMessageAr: settings.defaultGiftMessageAr ?? "",
      defaultGiftMessageEn: settings.defaultGiftMessageEn ?? "",
      enableGiftWrapping: settings.enableGiftWrapping,
      wrappingFee: String(settings.wrappingFee),
      greetingCardFee: String(settings.greetingCardFee),
      maxRecipientsPerGift: String(settings.maxRecipientsPerGift),
      termsAr: settings.termsAr ?? "",
      termsEn: settings.termsEn ?? "",
      privacyAr: settings.privacyAr ?? "",
      privacyEn: settings.privacyEn ?? "",
      returnsAr: settings.returnsAr ?? "",
      returnsEn: settings.returnsEn ?? "",
      supportEmail: settings.supportEmail,
      phone: settings.phone,
      whatsapp: settings.whatsapp ?? "",
      maintenanceMode: settings.maintenanceMode,
      acceptNewOrders: settings.acceptNewOrders,
      paymentCod: settings.paymentCod,
      paymentCreditCard: settings.paymentCreditCard,
      paymentVodafone: settings.paymentVodafone,
      paymentVodafoneWallet: settings.paymentVodafoneWallet ?? "",
      paymentVodafoneInstructions: settings.paymentVodafoneInstructions ?? "",
      paymentInstapay: settings.paymentInstapay,
      paymentInstapayName: settings.paymentInstapayName ?? "",
      paymentInstapayId: settings.paymentInstapayId ?? "",
      paymentInstapayInstructions: settings.paymentInstapayInstructions ?? "",
    });
    setSocialLinks(settings.socialLinks ?? []);
  }, [settings]);

  const set = (key: keyof typeof emptyForm, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    updateSettings.mutate(
      {
        data: {
          ...form,
          deliveryFee: parseFloat(form.deliveryFee) || 0,
          freeDeliveryThreshold: parseFloat(form.freeDeliveryThreshold) || 0,
          giftLinkExpiryDays: parseInt(form.giftLinkExpiryDays) || 7,
          maxGiftMessageLength: parseInt(form.maxGiftMessageLength) || 500,
          wrappingFee: parseFloat(form.wrappingFee) || 0,
          greetingCardFee: parseFloat(form.greetingCardFee) || 0,
          maxRecipientsPerGift: parseInt(form.maxRecipientsPerGift) || 1,
          logoUrl: form.logoUrl || undefined,
          faviconUrl: form.faviconUrl || undefined,
          defaultGiftMessageAr: form.defaultGiftMessageAr || undefined,
          defaultGiftMessageEn: form.defaultGiftMessageEn || undefined,
          termsAr: form.termsAr || undefined,
          termsEn: form.termsEn || undefined,
          privacyAr: form.privacyAr || undefined,
          privacyEn: form.privacyEn || undefined,
          returnsAr: form.returnsAr || undefined,
          returnsEn: form.returnsEn || undefined,
          whatsapp: form.whatsapp || undefined,
          paymentVodafoneWallet: form.paymentVodafoneWallet || undefined,
          paymentVodafoneInstructions: form.paymentVodafoneInstructions || undefined,
          paymentInstapayName: form.paymentInstapayName || undefined,
          paymentInstapayId: form.paymentInstapayId || undefined,
          paymentInstapayInstructions: form.paymentInstapayInstructions || undefined,
          socialLinks,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: t("تم حفظ الإعدادات بنجاح", "Settings saved successfully") });
        },
        onError: () => {
          toast({ title: t("حدث خطأ أثناء الحفظ", "Failed to save settings"), variant: "destructive" });
        },
      },
    );
  };

  const SaveButton = (
    <Button
      onClick={handleSave}
      disabled={updateSettings.isPending}
      className="gap-2 min-w-36"
    >
      <Save className="w-4 h-4" />
      {updateSettings.isPending ? t("جاري الحفظ...", "Saving...") : t("حفظ الإعدادات", "Save Settings")}
    </Button>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-foreground">
              {t("الإعدادات", "Settings")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("إدارة جميع إعدادات النظام والمتجر", "Manage all system and store configuration")}
            </p>
          </div>
          <div className="hidden sm:block">{SaveButton}</div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1 rounded-xl">
              <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm">
                <Settings2 className="w-3.5 h-3.5" />
                {t("عام", "General")}
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-1.5 text-xs sm:text-sm">
                <DollarSign className="w-3.5 h-3.5" />
                {t("مالي", "Financial")}
              </TabsTrigger>
              <TabsTrigger value="gifts" className="gap-1.5 text-xs sm:text-sm">
                <Gift className="w-3.5 h-3.5" />
                {t("الهدايا", "Gifts")}
              </TabsTrigger>
              <TabsTrigger value="policies" className="gap-1.5 text-xs sm:text-sm">
                <FileText className="w-3.5 h-3.5" />
                {t("السياسات", "Policies")}
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-1.5 text-xs sm:text-sm">
                <Zap className="w-3.5 h-3.5" />
                {t("النظام", "System")}
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5 text-xs sm:text-sm">
                <Share2 className="w-3.5 h-3.5" />
                {t("سوشيال", "Social & SEO")}
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-1.5 text-xs sm:text-sm">
                <CreditCard className="w-3.5 h-3.5" />
                {t("الدفع", "Payments")}
              </TabsTrigger>
            </TabsList>

            {/* ── General ──────────────────────────────────────────── */}
            <TabsContent value="general">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <SectionHeading icon={Settings2} title={t("الإعدادات العامة", "General Settings")} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("اسم الموقع (عربي)", "Site Name (AR)")}>
                    <Input value={form.storeNameAr} onChange={(e) => set("storeNameAr", e.target.value)} dir="rtl" />
                  </FieldRow>
                  <FieldRow label={t("اسم الموقع (إنجليزي)", "Site Name (EN)")}>
                    <Input value={form.storeNameEn} onChange={(e) => set("storeNameEn", e.target.value)} />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("المنطقة الزمنية", "Timezone")}>
                    <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label={t("اللغة الافتراضية", "Default Language")}>
                    <Select value={form.defaultLanguage} onValueChange={(v) => set("defaultLanguage", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("رابط شعار الموقع", "Site Logo URL")}>
                    <div className="relative">
                      <Link className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        className="ps-8"
                        placeholder="https://..."
                        value={form.logoUrl}
                        onChange={(e) => set("logoUrl", e.target.value)}
                      />
                    </div>
                  </FieldRow>
                  <FieldRow label={t("رابط الأيقونة (Favicon)", "Favicon URL")}>
                    <div className="relative">
                      <Link className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        className="ps-8"
                        placeholder="https://..."
                        value={form.faviconUrl}
                        onChange={(e) => set("faviconUrl", e.target.value)}
                      />
                    </div>
                  </FieldRow>
                </div>
              </div>
            </TabsContent>

            {/* ── Financial ────────────────────────────────────────── */}
            <TabsContent value="financial">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <SectionHeading icon={DollarSign} title={t("الإعدادات المالية", "Financial Settings")} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("رمز العملة (3 أحرف)", "Currency Code (3 letters)")}>
                    <Input
                      maxLength={3}
                      placeholder="SAR"
                      value={form.currencyCode}
                      onChange={(e) => set("currencyCode", e.target.value.toUpperCase())}
                    />
                  </FieldRow>
                  <FieldRow label={t("رمز العرض", "Displayed Symbol")}>
                    <Input
                      placeholder="ر.س"
                      value={form.currencySymbol}
                      onChange={(e) => set("currencySymbol", e.target.value)}
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("مدة التوصيل (عربي)", "Delivery Time (AR)")}>
                    <Input
                      dir="rtl"
                      placeholder="2-5 أيام عمل"
                      value={form.deliveryTimeAr}
                      onChange={(e) => set("deliveryTimeAr", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={t("مدة التوصيل (إنجليزي)", "Delivery Time (EN)")}>
                    <Input
                      placeholder="2-5 business days"
                      value={form.deliveryTimeEn}
                      onChange={(e) => set("deliveryTimeEn", e.target.value)}
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("رسوم التوصيل", "Delivery Fee")}>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.deliveryFee}
                      onChange={(e) => set("deliveryFee", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={t("حد التوصيل المجاني", "Free Delivery Threshold")}>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={form.freeDeliveryThreshold}
                      onChange={(e) => set("freeDeliveryThreshold", e.target.value)}
                    />
                  </FieldRow>
                </div>
              </div>
            </TabsContent>

            {/* ── Gifts ────────────────────────────────────────────── */}
            <TabsContent value="gifts">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <SectionHeading icon={Gift} title={t("إعدادات الهدايا", "Gift Settings")} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("صلاحية رابط الهدية (أيام)", "Gift Link Expiry (days)")}>
                    <Input
                      type="number" min="1"
                      value={form.giftLinkExpiryDays}
                      onChange={(e) => set("giftLinkExpiryDays", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={t("الحد الأقصى لطول رسالة الهدية", "Max Gift Message Length")}>
                    <Input
                      type="number" min="50"
                      value={form.maxGiftMessageLength}
                      onChange={(e) => set("maxGiftMessageLength", e.target.value)}
                    />
                  </FieldRow>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldRow label={t("الرسالة الافتراضية (عربي)", "Default Message (AR)")}>
                    <Textarea
                      dir="rtl"
                      rows={3}
                      placeholder={t("رسالة هدية افتراضية...", "Default gift message...")}
                      value={form.defaultGiftMessageAr}
                      onChange={(e) => set("defaultGiftMessageAr", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={t("الرسالة الافتراضية (إنجليزي)", "Default Message (EN)")}>
                    <Textarea
                      rows={3}
                      placeholder="Default gift message..."
                      value={form.defaultGiftMessageEn}
                      onChange={(e) => set("defaultGiftMessageEn", e.target.value)}
                    />
                  </FieldRow>
                </div>

                <ToggleRow
                  label={t("تفعيل تغليف الهدايا", "Enable Gift Wrapping")}
                  description={t("السماح للعملاء بإضافة تغليف للهدايا", "Allow customers to add gift wrapping")}
                  checked={form.enableGiftWrapping}
                  onCheckedChange={(v) => set("enableGiftWrapping", v)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FieldRow label={t("رسوم التغليف", "Wrapping Fee")}>
                    <Input
                      type="number" min="0" step="0.5"
                      value={form.wrappingFee}
                      onChange={(e) => set("wrappingFee", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={t("رسوم بطاقة التهنئة", "Greeting Card Fee")}>
                    <Input
                      type="number" min="0" step="0.5"
                      value={form.greetingCardFee}
                      onChange={(e) => set("greetingCardFee", e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={t("الحد الأقصى للمستلمين", "Max Recipients per Gift")}>
                    <Input
                      type="number" min="1"
                      value={form.maxRecipientsPerGift}
                      onChange={(e) => set("maxRecipientsPerGift", e.target.value)}
                    />
                  </FieldRow>
                </div>
              </div>
            </TabsContent>

            {/* ── Policies & Contact ───────────────────────────────── */}
            <TabsContent value="policies">
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <SectionHeading icon={FileText} title={t("السياسات والتواصل", "Policies & Contact")} />

                {/* Terms */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("الشروط والأحكام", "Terms & Conditions")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FieldRow label={t("عربي (HTML)", "Arabic (HTML)")}>
                      <Textarea dir="rtl" rows={6} placeholder="<p>الشروط والأحكام...</p>" value={form.termsAr} onChange={(e) => set("termsAr", e.target.value)} className="font-mono text-xs" />
                    </FieldRow>
                    <FieldRow label={t("إنجليزي (HTML)", "English (HTML)")}>
                      <Textarea rows={6} placeholder="<p>Terms and conditions...</p>" value={form.termsEn} onChange={(e) => set("termsEn", e.target.value)} className="font-mono text-xs" />
                    </FieldRow>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("سياسة الخصوصية", "Privacy Policy")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FieldRow label={t("عربي (HTML)", "Arabic (HTML)")}>
                      <Textarea dir="rtl" rows={6} placeholder="<p>سياسة الخصوصية...</p>" value={form.privacyAr} onChange={(e) => set("privacyAr", e.target.value)} className="font-mono text-xs" />
                    </FieldRow>
                    <FieldRow label={t("إنجليزي (HTML)", "English (HTML)")}>
                      <Textarea rows={6} placeholder="<p>Privacy policy...</p>" value={form.privacyEn} onChange={(e) => set("privacyEn", e.target.value)} className="font-mono text-xs" />
                    </FieldRow>
                  </div>
                </div>

                {/* Returns */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("سياسة الإرجاع", "Returns Policy")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FieldRow label={t("عربي (HTML)", "Arabic (HTML)")}>
                      <Textarea dir="rtl" rows={6} placeholder="<p>سياسة الإرجاع...</p>" value={form.returnsAr} onChange={(e) => set("returnsAr", e.target.value)} className="font-mono text-xs" />
                    </FieldRow>
                    <FieldRow label={t("إنجليزي (HTML)", "English (HTML)")}>
                      <Textarea rows={6} placeholder="<p>Returns policy...</p>" value={form.returnsEn} onChange={(e) => set("returnsEn", e.target.value)} className="font-mono text-xs" />
                    </FieldRow>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{t("بيانات التواصل", "Contact Details")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <FieldRow label={t("البريد الإلكتروني للدعم", "Support Email")}>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input type="email" className="ps-8" placeholder="support@hadaya.com" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
                      </div>
                    </FieldRow>
                    <FieldRow label={t("رقم الهاتف", "Phone")}>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input className="ps-8" placeholder="+966 5x xxx xxxx" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                      </div>
                    </FieldRow>
                    <FieldRow label={t("واتساب", "WhatsApp")}>
                      <div className="relative">
                        <Smartphone className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input className="ps-8" placeholder="+966 5x xxx xxxx" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                      </div>
                    </FieldRow>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── System ───────────────────────────────────────────── */}
            <TabsContent value="system">
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <SectionHeading icon={Zap} title={t("إعدادات النظام", "System Settings")} />

                <ToggleRow
                  label={t("وضع الصيانة", "Maintenance Mode")}
                  description={t(
                    "عند التفعيل يرى الزوار صفحة الصيانة ولا يمكنهم الوصول للمتجر",
                    "When active, visitors see a maintenance page and cannot access the store",
                  )}
                  checked={form.maintenanceMode}
                  onCheckedChange={(v) => set("maintenanceMode", v)}
                  warning
                />

                <ToggleRow
                  label={t("قبول الطلبات الجديدة", "Accept New Orders")}
                  description={t(
                    "عند التعطيل لن يتمكن العملاء من إتمام عملية الشراء",
                    "When disabled, customers cannot complete purchases",
                  )}
                  checked={form.acceptNewOrders}
                  onCheckedChange={(v) => set("acceptNewOrders", v)}
                  warning={!form.acceptNewOrders}
                />
              </div>
            </TabsContent>

            {/* ── Social & SEO ─────────────────────────────────────── */}
            <TabsContent value="social">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <SectionHeading icon={Share2} title={t("روابط التواصل الاجتماعي", "Social Media Links")} />

                <div className="space-y-3">
                  {socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            className="ps-8"
                            placeholder={t("اسم المنصة", "Platform name")}
                            value={link.platform}
                            onChange={(e) => {
                              const next = [...socialLinks];
                              next[idx] = { ...next[idx], platform: e.target.value };
                              setSocialLinks(next);
                            }}
                          />
                        </div>
                        <div className="relative">
                          <Link className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            className="ps-8"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => {
                              const next = [...socialLinks];
                              next[idx] = { ...next[idx], url: e.target.value };
                              setSocialLinks(next);
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="gap-2 w-full border-dashed"
                    onClick={() => setSocialLinks([...socialLinks, { platform: "", url: "" }])}
                  >
                    <Plus className="w-4 h-4" />
                    {t("إضافة منصة", "Add Platform")}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ── Payments ─────────────────────────────────────────── */}
            <TabsContent value="payments">
              <div className="space-y-4">

                {/* COD */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <ToggleRow
                    label={t("الدفع عند الاستلام (COD)", "Cash on Delivery (COD)")}
                    description={t("يدفع العميل نقداً عند استلام الطلب", "Customer pays cash upon delivery")}
                    checked={form.paymentCod}
                    onCheckedChange={(v) => set("paymentCod", v)}
                  />
                </div>

                {/* Credit Card */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <ToggleRow
                    label={t("بطاقة الائتمان / بوابة الدفع", "Credit Card / Payment Gateway")}
                    description={t("تفعيل الدفع بالبطاقة الائتمانية — يتطلب ربط مزود الدفع", "Activate credit card payment — requires connecting a payment provider")}
                    checked={form.paymentCreditCard}
                    onCheckedChange={(v) => set("paymentCreditCard", v)}
                  />
                  {form.paymentCreditCard && (
                    <p className="text-xs text-muted-foreground bg-muted rounded-md p-3">
                      {t(
                        "لتفعيل الدفع بالبطاقة يجب ربط حساب مزود الدفع (Stripe / HyperPay / Tap).",
                        "To activate card payments, connect your payment provider (Stripe / HyperPay / Tap).",
                      )}
                    </p>
                  )}
                </div>

                {/* Vodafone Cash */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <ToggleRow
                    label={t("فودافون كاش", "Vodafone Cash")}
                    description={t("استقبال المدفوعات عبر محفظة فودافون كاش", "Receive payments via Vodafone Cash wallet")}
                    checked={form.paymentVodafone}
                    onCheckedChange={(v) => set("paymentVodafone", v)}
                  />
                  {form.paymentVodafone && (
                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <FieldRow label={t("رقم المحفظة", "Wallet Number")}>
                        <div className="relative">
                          <Smartphone className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input className="ps-8" placeholder="01x xxxx xxxx" value={form.paymentVodafoneWallet} onChange={(e) => set("paymentVodafoneWallet", e.target.value)} />
                        </div>
                      </FieldRow>
                      <FieldRow label={t("تعليمات العميل", "Customer Instructions")}>
                        <Textarea rows={3} placeholder={t("كيفية إتمام الدفع...", "How to complete the payment...")} value={form.paymentVodafoneInstructions} onChange={(e) => set("paymentVodafoneInstructions", e.target.value)} />
                      </FieldRow>
                    </div>
                  )}
                </div>

                {/* Instapay */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <ToggleRow
                    label={t("إنستاباي (InstaPay)", "InstaPay")}
                    description={t("استقبال المدفوعات عبر إنستاباي", "Receive payments via InstaPay")}
                    checked={form.paymentInstapay}
                    onCheckedChange={(v) => set("paymentInstapay", v)}
                  />
                  {form.paymentInstapay && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <FieldRow label={t("اسم الحساب", "Account Name")}>
                        <Input placeholder={t("الاسم كامل", "Full name")} value={form.paymentInstapayName} onChange={(e) => set("paymentInstapayName", e.target.value)} />
                      </FieldRow>
                      <FieldRow label={t("معرّف الحساب / العنوان", "Account ID / Address")}>
                        <Input placeholder="user@instapay" value={form.paymentInstapayId} onChange={(e) => set("paymentInstapayId", e.target.value)} />
                      </FieldRow>
                      <div className="sm:col-span-2">
                        <FieldRow label={t("تعليمات العميل", "Customer Instructions")}>
                          <Textarea rows={3} placeholder={t("كيفية إتمام الدفع...", "How to complete the payment...")} value={form.paymentInstapayInstructions} onChange={(e) => set("paymentInstapayInstructions", e.target.value)} />
                        </FieldRow>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Mobile save button */}
        <div className="sm:hidden">{SaveButton}</div>
      </div>
    </AdminLayout>
  );
}
