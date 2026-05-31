import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Gift, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      toast({ title: t("تم تسجيل الدخول بنجاح", "Logged in successfully") });
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
            {t("تسجيل الدخول", "Sign In")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("أهلاً بعودتك!", "Welcome back!")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                {t("البريد الإلكتروني", "Email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("example@email.com", "example@email.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                data-testid="input-email"
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
                  placeholder={t("••••••••", "••••••••")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
              data-testid="button-login"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("تسجيل الدخول", "Sign In")
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {t("ليس لديك حساب؟", "Don't have an account?")}{" "}
            <Link href="/register">
              <span className="text-primary font-medium cursor-pointer hover:underline">
                {t("إنشاء حساب", "Create account")}
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
