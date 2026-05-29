import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, User, CreditCard, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { useCreateOrder, useGetSettings } from "@workspace/api-client-react";
import { StoreLayout } from "@/components/store-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_METHODS = [
  { value: "cash_on_delivery" as const, ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  { value: "bank_transfer" as const, ar: "تحويل بنكي", en: "Bank Transfer" },
  { value: "card" as const, ar: "بطاقة ائتمان", en: "Credit Card" },
];

type Step = "details" | "payment" | "confirm";

export default function CheckoutPage() {
  const { t, lang } = useLanguage();
  const { items, subtotal, clearCart } = useCart();
  const { data: settings } = useGetSettings();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    recipientAddress: "",
    recipientCity: "",
    notes: "",
    isGift: false,
    paymentMethod: "cash_on_delivery" as "cash_on_delivery" | "bank_transfer" | "card",
  });

  const deliveryFee = settings ? settings.deliveryFeeDefault : 25;
  const total = subtotal + deliveryFee;

  const handleSubmit = () => {
    createOrder.mutate(
      {
        data: {
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          isGift: form.isGift,
          recipientAddress: form.recipientAddress || undefined,
          recipientCity: form.recipientCity || undefined,
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
          <div className="lg:col-span-2">
            {step === "details" && (
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
                  <div className="flex items-center gap-3">
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
                <Button className="w-full mt-2" onClick={() => setStep("payment")} data-testid="button-next-payment">
                  {t("التالي", "Next")}
                </Button>
              </div>
            )}

            {step === "payment" && (
              <div className="bg-card border border-card-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg">{t("طريقة الدفع", "Payment Method")}</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
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
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("details")} data-testid="button-back-details">
                    {t("السابق", "Back")}
                  </Button>
                  <Button className="flex-1" onClick={() => setStep("confirm")} data-testid="button-next-confirm">
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
                    <span className="text-muted-foreground">{t("طريقة الدفع", "Payment")}</span>
                    <span>{lang === "ar" ? PAYMENT_METHODS.find((p) => p.value === form.paymentMethod)?.ar : PAYMENT_METHODS.find((p) => p.value === form.paymentMethod)?.en}</span>
                  </div>
                  {form.isGift && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("نوع الطلب", "Order Type")}</span>
                      <span className="text-primary">{t("هدية", "Gift")}</span>
                    </div>
                  )}
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
                  <span className="shrink-0">{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                <span>{deliveryFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("الإجمالي", "Total")}</span>
                <span className="text-primary">{total.toFixed(2)} {t("ر.س", "SAR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
