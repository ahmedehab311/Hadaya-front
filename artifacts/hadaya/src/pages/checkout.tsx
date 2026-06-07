import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle,
  User,
  CreditCard,
  MapPin,
  Gift,
  Upload,
  Info,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { useCreateOrder, useGetSettings } from "@workspace/api-client-react";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ALL_PAYMENT_METHODS = [
  { value: "cash_on_delivery" as const, ar: "الدفع عند الاستلام (COD)", en: "Cash on Delivery (COD)" },
  { value: "vodafone_cash" as const, ar: "فودافون كاش", en: "Vodafone Cash" },
  { value: "instapay" as const, ar: "إنستا باي", en: "InstaPay" },
  { value: "card" as const, ar: "بطاقة ائتمان", en: "Credit Card" },
];

const EGYPT_CITIES = [
  { value: "cairo", ar: "القاهرة", en: "Cairo" },
  { value: "giza", ar: "الجيزة", en: "Giza" },
  { value: "alexandria", ar: "الإسكندرية", en: "Alexandria" },
  { value: "mansoura", ar: "المنصورة", en: "Mansoura" },
  { value: "tanta", ar: "طنطا", en: "Tanta" },
  { value: "asyut", ar: "أسيوط", en: "Asyut" },
  { value: "luxor", ar: "الأقصر", en: "Luxor" },
  { value: "aswan", ar: "أسوان", en: "Aswan" },
];

type Step = "details" | "payment" | "confirm";
type DeliveryType = "self" | "other";
type AddressMode = "known" | "unknown";
type PaymentMethod = "cash_on_delivery" | "vodafone_cash" | "instapay" | "card";

interface FormErrors {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  city?: string;
  street?: string;
  building?: string;
  paymentReceipt?: string;
}

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const { items, subtotal, clearCart } = useCart();
  const { data: settings } = useGetSettings();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<Step>("details");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("self");
  const [addressMode, setAddressMode] = useState<AddressMode>("known");
  const [errors, setErrors] = useState<FormErrors>({});
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    recipientName: "",
    recipientPhone: "+20",
    recipientEmail: "",
    city: "",
    street: "",
    building: "",
    landmark: "",
    deliveryDate: "",
    deliveryTime: "",
    notes: "",
    isGift: false,
    paymentMethod: "cash_on_delivery" as PaymentMethod,
  });

  const deliveryFee = settings ? settings.deliveryFee : 25;
  const total = subtotal + deliveryFee;

  // Dynamic payment methods: hide COD when buying for someone else
  const paymentMethods = useMemo(
    () =>
      ALL_PAYMENT_METHODS.filter((pm) =>
        deliveryType === "other" ? pm.value !== "cash_on_delivery" : true,
      ),
    [deliveryType],
  );

  // If user switches to "other" while COD selected, swap to vodafone_cash
  if (deliveryType === "other" && form.paymentMethod === "cash_on_delivery") {
    setForm((f) => ({ ...f, paymentMethod: "vodafone_cash" }));
  }

  const requiresReceipt =
    form.paymentMethod === "vodafone_cash" || form.paymentMethod === "instapay";

  const validateDetails = (): boolean => {
    const e: FormErrors = {};
    if (deliveryType === "other") {
      if (!form.recipientName.trim()) e.recipientName = t("اسم المستلم مطلوب", "Recipient name is required");
      if (!/^\+20\d{10}$/.test(form.recipientPhone.replace(/\s/g, "")))
        e.recipientPhone = t("رقم المستلم يجب أن يبدأ بـ +20 ويحتوي على 10 أرقام", "Phone must start with +20 followed by 10 digits");
      if (form.recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail))
        e.recipientEmail = t("البريد الإلكتروني غير صالح", "Invalid email");
      if (addressMode === "known") {
        if (!form.city) e.city = t("المدينة مطلوبة", "City is required");
        if (!form.street.trim()) e.street = t("عنوان الشارع مطلوب", "Street address is required");
        if (!form.building.trim()) e.building = t("المبنى/الطابق مطلوب", "Building/Floor is required");
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = (): boolean => {
    const e: FormErrors = { ...errors };
    delete e.paymentReceipt;
    if (requiresReceipt && !receiptFile) {
      e.paymentReceipt = t("يجب رفع صورة الإيصال", "Receipt screenshot is required");
    }
    setErrors(e);
    return !e.paymentReceipt;
  };

  const handleReceiptChange = (file: File | null) => {
    setReceiptFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleSubmit = () => {
    const recipientAddress =
      deliveryType === "other" && addressMode === "known"
        ? `${form.street}, ${form.building}${form.landmark ? `, ${form.landmark}` : ""}`
        : undefined;
    const recipientCity =
      deliveryType === "other" && addressMode === "known"
        ? EGYPT_CITIES.find((c) => c.value === form.city)?.ar
        : undefined;

    createOrder.mutate(
      {
        data: {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail,
          paymentMethod: (form.paymentMethod === "vodafone_cash" || form.paymentMethod === "instapay"
            ? "bank_transfer"
            : form.paymentMethod) as "cash_on_delivery" | "bank_transfer" | "card",
          notes: [
            form.notes,
            deliveryType === "other" ? `Recipient: ${form.recipientName} (${form.recipientPhone})` : "",
            deliveryType === "other" && addressMode === "unknown" ? "Address to be collected from recipient via WhatsApp/SMS" : "",
            form.deliveryDate ? `Delivery: ${form.deliveryDate} ${form.deliveryTime}` : "",
          ].filter(Boolean).join(" | "),
          isGift: form.isGift || deliveryType === "other",
          recipientAddress,
          recipientCity,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ title: t("حدث خطأ", "An error occurred"), variant: "destructive" });
        },
      },
    );
  };

  const steps: { key: Step; icon: React.ElementType; ar: string; en: string }[] = [
    { key: "details", icon: User, ar: "البيانات", en: "Details" },
    { key: "payment", icon: CreditCard, ar: "الدفع", en: "Payment" },
    { key: "confirm", icon: CheckCircle, ar: "التأكيد", en: "Confirm" },
  ];

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-8">{t("إتمام الطلب", "Checkout")}</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const stepIdx = steps.findIndex((x) => x.key === step);
            const isActive = s.key === step;
            const isDone = i < stepIdx;
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i > 0 ? "flex-1" : ""}`}>
                  {i > 0 && <div className={`h-px flex-1 ${isDone || isActive ? "bg-primary" : "bg-border"}`} />}
                  <div className={`flex items-center gap-1.5 shrink-0 ${isActive ? "text-primary" : isDone ? "text-primary/70" : "text-muted-foreground"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? "border-primary bg-primary text-primary-foreground" : isDone ? "border-primary/70 bg-primary/10" : "border-border"}`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{lang === "ar" ? s.ar : s.en}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === "details" && (
              <>
                {/* Delivery Type Selector */}
                <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    {t("نوع التوصيل", "Delivery Type")}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(["self", "other"] as const).map((dt) => (
                      <label
                        key={dt}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${deliveryType === dt ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                        data-testid={`delivery-type-${dt}`}
                      >
                        <input
                          type="radio"
                          name="deliveryType"
                          value={dt}
                          checked={deliveryType === dt}
                          onChange={() => setDeliveryType(dt)}
                          className="accent-primary"
                        />
                        <span className="font-medium">
                          {dt === "self" ? t("لنفسي", "For Myself") : t("لشخص آخر", "For Someone Else")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Customer details */}
                <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
                  <h2 className="font-semibold text-lg">{t("بيانات العميل", "Customer Details")}</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>{t("الاسم", "Name")}</Label>
                      <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} data-testid="input-name" />
                    </div>
                    <div>
                      <Label>{t("رقم الجوال", "Phone")}</Label>
                      <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} data-testid="input-phone" />
                    </div>
                    <div>
                      <Label>{t("البريد الإلكتروني", "Email")}</Label>
                      <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} data-testid="input-email" />
                    </div>
                    <div>
                      <Label>{t("ملاحظات", "Notes")}</Label>
                      <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="input-notes" />
                    </div>
                  </div>
                </div>

                {/* Recipient / Address section */}
                <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    {deliveryType === "other" ? (
                      <>
                        <User className="w-5 h-5 text-primary" />
                        {t("بيانات المستلم", "Recipient Details")}
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5 text-primary" />
                        {t("عنوان التوصيل", "Delivery Address")}
                      </>
                    )}
                  </h2>

                  {deliveryType === "other" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>{t("اسم المستلم", "Recipient Name")} *</Label>
                        <Input
                          value={form.recipientName}
                          onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                          data-testid="input-recipient-name"
                        />
                        {errors.recipientName && <p className="text-xs text-destructive mt-1">{errors.recipientName}</p>}
                      </div>
                      <div>
                        <Label>{t("رقم المستلم (مع كود +20)", "Recipient Phone (with +20)")} *</Label>
                        <Input
                          value={form.recipientPhone}
                          onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                          placeholder="+201234567890"
                          dir="ltr"
                          data-testid="input-recipient-phone"
                        />
                        {errors.recipientPhone && <p className="text-xs text-destructive mt-1">{errors.recipientPhone}</p>}
                      </div>
                      <div>
                        <Label>{t("البريد الإلكتروني (اختياري)", "Email (Optional)")}</Label>
                        <Input
                          type="email"
                          value={form.recipientEmail}
                          onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                          data-testid="input-recipient-email"
                        />
                        {errors.recipientEmail && <p className="text-xs text-destructive mt-1">{errors.recipientEmail}</p>}
                      </div>

                      {/* Address mode toggle */}
                      <div className="pt-2">
                        <Label className="mb-2 block">{t("العنوان", "Address")}</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(["known", "unknown"] as const).map((m) => (
                            <label
                              key={m}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${addressMode === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                              data-testid={`address-mode-${m}`}
                            >
                              <input
                                type="radio"
                                name="addressMode"
                                value={m}
                                checked={addressMode === m}
                                onChange={() => setAddressMode(m)}
                                className="accent-primary"
                              />
                              <span className="text-sm font-medium">
                                {m === "known" ? t("أعرف العنوان", "I know the address") : t("لا أعرف عنوان المستلم", "I don't know the recipient's address")}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {addressMode === "known" ? (
                        <div className="grid grid-cols-1 gap-4 pt-2">
                          <div>
                            <Label>{t("المدينة", "City")} *</Label>
                            <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                              <SelectTrigger data-testid="select-city">
                                <SelectValue placeholder={t("اختر المدينة", "Select city")} />
                              </SelectTrigger>
                              <SelectContent>
                                {EGYPT_CITIES.map((c) => (
                                  <SelectItem key={c.value} value={c.value}>
                                    {lang === "ar" ? c.ar : c.en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                          </div>
                          <div>
                            <Label>{t("عنوان الشارع", "Street Address")} *</Label>
                            <Input
                              value={form.street}
                              onChange={(e) => setForm({ ...form, street: e.target.value })}
                              data-testid="input-street"
                            />
                            {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
                          </div>
                          <div>
                            <Label>{t("المبنى / الطابق", "Building / Floor")} *</Label>
                            <Input
                              value={form.building}
                              onChange={(e) => setForm({ ...form, building: e.target.value })}
                              data-testid="input-building"
                            />
                            {errors.building && <p className="text-xs text-destructive mt-1">{errors.building}</p>}
                          </div>
                          <div>
                            <Label>{t("علامة مميزة", "Landmark")}</Label>
                            <Input
                              value={form.landmark}
                              onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                              data-testid="input-landmark"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>{t("يوم التوصيل", "Delivery Day")}</Label>
                              <Input
                                type="date"
                                value={form.deliveryDate}
                                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                                data-testid="input-delivery-date"
                              />
                            </div>
                            <div>
                              <Label>{t("وقت التوصيل", "Delivery Time")}</Label>
                              <Input
                                type="time"
                                value={form.deliveryTime}
                                onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                                data-testid="input-delivery-time"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20" data-testid="card-unknown-address">
                          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {t(
                              "سنرسل للمستلم رابطاً لإكمال العنوان عبر واتساب/SMS",
                              "We'll send the recipient a link to complete the address via WhatsApp/SMS",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === "self" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>{t("المدينة", "City")}</Label>
                        <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                          <SelectTrigger data-testid="select-self-city">
                            <SelectValue placeholder={t("اختر المدينة", "Select city")} />
                          </SelectTrigger>
                          <SelectContent>
                            {EGYPT_CITIES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {lang === "ar" ? c.ar : c.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t("عنوان الشارع", "Street Address")}</Label>
                        <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                      </div>
                      <div>
                        <Label>{t("المبنى / الطابق", "Building / Floor")}</Label>
                        <Input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isGift"
                      checked={form.isGift}
                      onChange={(e) => setForm({ ...form, isGift: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                      data-testid="checkbox-is-gift"
                    />
                    <Label htmlFor="isGift">{t("هذا الطلب هدية", "This is a gift")}</Label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    if (validateDetails()) setStep("payment");
                  }}
                  data-testid="button-next-payment"
                >
                  {t("التالي", "Next")}
                </Button>
              </>
            )}

            {step === "payment" && (
              <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg">{t("طريقة الدفع", "Payment Method")}</h2>

                {deliveryType === "other" && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground border border-border">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {t(
                        "خيار الدفع عند الاستلام غير متاح للطلبات المُرسلة لشخص آخر.",
                        "Cash on Delivery is not available for orders sent to someone else.",
                      )}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.value}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${form.paymentMethod === pm.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      data-testid={`payment-method-${pm.value}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={form.paymentMethod === pm.value}
                        onChange={() => setForm({ ...form, paymentMethod: pm.value })}
                        className="accent-primary"
                      />
                      <span className="font-medium">{lang === "ar" ? pm.ar : pm.en}</span>
                    </label>
                  ))}
                </div>

                {requiresReceipt && (
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="space-y-1.5 text-sm">
                      <p className="font-semibold text-foreground">
                        {form.paymentMethod === "vodafone_cash"
                          ? t("تعليمات فودافون كاش", "Vodafone Cash Instructions")
                          : t("تعليمات إنستا باي", "InstaPay Instructions")}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {form.paymentMethod === "vodafone_cash"
                          ? t(
                              "حوّل المبلغ على رقم 01000000000 ثم ارفع صورة الإيصال.",
                              "Transfer the amount to 01000000000 then upload the receipt screenshot.",
                            )
                          : t(
                              "حوّل المبلغ إلى @hadaya على إنستا باي ثم ارفع صورة الإيصال.",
                              "Transfer the amount to @hadaya on InstaPay then upload the receipt screenshot.",
                            )}
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Upload className="w-4 h-4" />
                        {t("رفع صورة الإيصال", "Upload Receipt Screenshot")} *
                      </Label>

                      {receiptPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={receiptPreview}
                            alt="receipt preview"
                            className="max-h-48 rounded-lg border border-border"
                            data-testid="img-receipt-preview"
                          />
                          <button
                            type="button"
                            onClick={() => handleReceiptChange(null)}
                            className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                            data-testid="button-remove-receipt"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {t("اضغط لاختيار صورة الإيصال", "Click to select receipt image")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
                            data-testid="input-receipt-file"
                          />
                        </label>
                      )}
                      {errors.paymentReceipt && <p className="text-xs text-destructive mt-1">{errors.paymentReceipt}</p>}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("details")} data-testid="button-back-details">
                    {t("السابق", "Back")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (validatePayment()) setStep("confirm");
                    }}
                    data-testid="button-next-confirm"
                  >
                    {t("التالي", "Next")}
                  </Button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  {t("تأكيد الطلب", "Confirm Order")}
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("الاسم", "Name")}</span>
                    <span>{form.customerName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("الجوال", "Phone")}</span>
                    <span>{form.customerPhone || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("نوع التوصيل", "Delivery Type")}</span>
                    <span>{deliveryType === "self" ? t("لنفسي", "For Myself") : t("لشخص آخر", "For Someone Else")}</span>
                  </div>
                  {deliveryType === "other" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("المستلم", "Recipient")}</span>
                        <span>{form.recipientName} ({form.recipientPhone})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("العنوان", "Address")}</span>
                        <span className="text-right max-w-[60%]">
                          {addressMode === "known"
                            ? `${form.street}, ${form.building}`
                            : t("سيتم جمعه من المستلم", "To be collected from recipient")}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("طريقة الدفع", "Payment")}</span>
                    <span>{lang === "ar" ? ALL_PAYMENT_METHODS.find((p) => p.value === form.paymentMethod)?.ar : ALL_PAYMENT_METHODS.find((p) => p.value === form.paymentMethod)?.en}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("payment")} data-testid="button-back-payment">
                    {t("السابق", "Back")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={createOrder.isPending}
                    data-testid="button-place-order"
                  >
                    {createOrder.isPending ? t("جاري...", "Placing...") : t("تأكيد الطلب", "Place Order")}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-card-border rounded-xl p-5 h-fit sticky top-24">
            <h3 className="font-bold mb-4">{t("الطلب", "Order")}</h3>
            <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">
                    {lang === "ar" ? item.nameAr : item.nameEn} × {item.quantity}
                  </span>
                  <span className="shrink-0">{(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                <span>{(subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                <span>{(Number(deliveryFee) || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("الإجمالي", "Total")}</span>
                <span className="text-primary">{(total || 0).toFixed(2)} {t("ر.س", "SAR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
