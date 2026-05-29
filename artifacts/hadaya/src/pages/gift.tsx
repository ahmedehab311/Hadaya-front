import { useParams } from "wouter";
import { Gift, CheckCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useGetGiftByToken, useSubmitGiftAddress, getGetGiftByTokenQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function GiftPage() {
  const { token } = useParams<{ token: string }>();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const submitAddress = useSubmitGiftAddress();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const { data: gift, isLoading, error } = useGetGiftByToken(token, {
    query: { enabled: !!token, queryKey: getGetGiftByTokenQueryKey(token) },
  });

  const handleSubmit = () => {
    if (!address.trim() || !city.trim()) {
      toast({ title: t("يرجى ملء جميع الحقول", "Please fill all fields"), variant: "destructive" });
      return;
    }
    submitAddress.mutate(
      { token, data: { recipientAddress: address, recipientCity: city } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGiftByTokenQueryKey(token) });
          toast({ title: t("تم حفظ عنوانك بنجاح!", "Address saved successfully!") });
        },
        onError: () => {
          toast({ title: t("حدث خطأ", "An error occurred"), variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLoading ? (
          <div className="bg-card border border-card-border rounded-2xl p-8 space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error || !gift ? (
          <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold font-serif text-foreground mb-2">
              {t("الرابط غير صالح", "Invalid Link")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("هذا الرابط غير صالح أو منتهي الصلاحية", "This link is invalid or has expired")}
            </p>
          </div>
        ) : gift.isAddressSubmitted ? (
          <div className="bg-card border border-card-border rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-foreground mb-3">
              {t("تم استلام عنوانك!", "Address Received!")}
            </h2>
            <p className="text-muted-foreground mb-5">
              {t("سيتم توصيل هديتك إلى العنوان المسجل قريباً.", "Your gift will be delivered to the registered address soon.")}
            </p>
            {gift.recipientCity && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{gift.recipientAddress}, {gift.recipientCity}</span>
              </div>
            )}
            <div className="mt-6 flex items-center justify-center gap-2 text-primary">
              <Gift className="w-5 h-5" />
              <span className="font-bold font-serif text-lg">{t("هدايا", "Hadaya")}</span>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-foreground mb-2">
                {t("لديك هدية!", "You Have a Gift!")}
              </h2>
              {gift.senderName && (
                <p className="text-muted-foreground">
                  {t(`أرسل لك ${gift.senderName} هدية مميزة`, `${gift.senderName} sent you a special gift`)}
                </p>
              )}
              {gift.message && (
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground text-start">
                  <p className="font-medium text-primary mb-1">{t("رسالة من المرسل:", "Message from sender:")}</p>
                  <p>{gift.message}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                {t("المنتجات", "Items")}
              </h3>
              <div className="space-y-2">
                {gift.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
                    <img
                      src={item.productImageUrl || "https://placehold.co/40x40/f5e8d8/9b6b52?text=H"}
                      alt={lang === "ar" ? item.productNameAr : item.productNameEn}
                      className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
                    />
                    <span className="text-sm font-medium">{lang === "ar" ? item.productNameAr : item.productNameEn}</span>
                    <span className="text-xs text-muted-foreground ms-auto">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="font-semibold mb-4">{t("أدخل عنوان التوصيل", "Enter Delivery Address")}</h3>
            <div className="space-y-4">
              <div>
                <Label>{t("العنوان التفصيلي", "Detailed Address")}</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("الشارع، الحي، رقم المبنى...", "Street, district, building no...")}
                  data-testid="input-gift-address"
                />
              </div>
              <div>
                <Label>{t("المدينة", "City")}</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("مثال: الرياض", "e.g. Riyadh")}
                  data-testid="input-gift-city"
                />
              </div>
              <Button
                className="w-full gap-2"
                onClick={handleSubmit}
                disabled={submitAddress.isPending}
                data-testid="button-submit-address"
              >
                <MapPin className="w-4 h-4" />
                {submitAddress.isPending ? t("جاري الحفظ...", "Saving...") : t("تأكيد العنوان", "Confirm Address")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
