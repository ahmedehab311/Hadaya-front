import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Gift, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, password } = form;
    if (!name || !email || !phone || !password) return;

    if (password.length < 6) {
      toast({
        title: t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, phone, password });
      toast({ title: t("تم إنشاء الحساب بنجاح!", "Account created successfully!") });
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        t("حدث خطأ، حاول مرة أخرى", "Something went wrong, please try again");
      toast({ title: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-2xl font-serif cursor-pointer">
              <Gift className="w-7 h-7" />
              <span>{t("هدايا", "Hadaya")}</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-4">
            {t("إنشاء حساب جديد", "Create Account")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("انضم إلينا واكتشف أجمل الهدايا", "Join us and discover the finest gifts")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">
                {t("الاسم الكامل", "Full Name")}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t("أحمد محمد", "Ahmed Mohamed")}
                value={form.name}
                onChange={set("name")}
                required
                autoComplete="name"
                data-testid="input-name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                {t("البريد الإلكتروني", "Email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("example@email.com", "example@email.com")}
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
                data-testid="input-email"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                {t("رقم الهاتف", "Phone Number")}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t("05xxxxxxxx", "05xxxxxxxx")}
                value={form.phone}
                onChange={set("phone")}
                required
                autoComplete="tel"
                data-testid="input-phone"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">
                {t("كلمة المرور", "Password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("6 أحرف على الأقل", "At least 6 characters")}
                  value={form.password}
                  onChange={set("password")}
                  required
                  autoComplete="new-password"
                  className="pe-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("يجب أن تكون 6 أحرف على الأقل", "Must be at least 6 characters")}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !form.name || !form.email || !form.phone || !form.password}
              data-testid="button-register"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("إنشاء الحساب", "Create Account")
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {t("لديك حساب بالفعل؟", "Already have an account?")}{" "}
            <Link href="/login">
              <span className="text-primary font-medium cursor-pointer hover:underline">
                {t("تسجيل الدخول", "Sign In")}
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              {t("← العودة للمتجر", "← Back to store")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
