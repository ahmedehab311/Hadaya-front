import { Link, useLocation } from "wouter";
import { ShoppingCart, Sun, Moon, Globe, Gift, Package, Menu, X, User, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { type ReactNode } from "react";

export function StoreLayout({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  const navLinks = [
    { href: "/", label: t("الرئيسية", "Home") },
    { href: "/products", label: t("المنتجات", "Products") },
    { href: "/collections", label: t("المجموعات", "Collections") },
  ];

  const handleLogout = async () => {
    await logout();
    toast({ title: t("تم تسجيل الخروج", "Logged out successfully") });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-serif text-primary tracking-wide">
              {t("هدايا", "Hadaya")}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              data-testid="button-toggle-lang"
              title={t("English", "العربية")}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-toggle-theme">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Account button */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-account">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("تسجيل الخروج", "Sign Out")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" data-testid="button-login-nav" title={t("تسجيل الدخول", "Sign In")}>
                  <LogIn className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 h-4 min-w-4 p-0 flex items-center justify-center text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium py-1 transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-3">
              {isLoggedIn && user ? (
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm text-destructive py-1"
                >
                  <LogOut className="w-4 h-4" />
                  {t("تسجيل الخروج", "Sign Out")}
                </button>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-2 text-sm text-primary py-1">
                    <LogIn className="w-4 h-4" />
                    {t("تسجيل الدخول", "Sign In")}
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/30 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary font-serif">{t("هدايا", "Hadaya")}</span>
          </div>
          <span>{t("© 2025 هدايا. جميع الحقوق محفوظة.", "© 2025 Hadaya. All rights reserved.")}</span>
          <Link href="/admin" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Package className="w-3.5 h-3.5" />
            <span>{t("لوحة التحكم", "Admin Panel")}</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
