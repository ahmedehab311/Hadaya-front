import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ShoppingBag, Package, Layers, Settings, Gift,
  Sun, Moon, Globe, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  labelAr: string;
  labelEn: string;
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", icon: LayoutDashboard, labelAr: "لوحة التحكم", labelEn: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingBag, labelAr: "الطلبات", labelEn: "Orders" },
  { href: "/admin/products", icon: Package, labelAr: "المنتجات", labelEn: "Products" },
  { href: "/admin/collections", icon: Layers, labelAr: "المجموعات", labelEn: "Collections" },
  { href: "/admin/settings", icon: Settings, labelAr: "الإعدادات", labelEn: "Settings" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { lang, setLang, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full", mobile ? "w-64" : (collapsed ? "w-16" : "w-60"))}>
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border shrink-0">
        <Gift className="w-6 h-6 text-sidebar-primary shrink-0" />
        {(!collapsed || mobile) && (
          <span className="font-bold font-serif text-sidebar-primary text-lg truncate">
            {t("هدايا", "Hadaya")}
          </span>
        )}
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ms-auto h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {(collapsed && !isRTL) || (!collapsed && isRTL)
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronLeft className="w-4 h-4" />
            }
          </Button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => mobile && setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                data-testid={`nav-admin-${item.href.split("/").pop()}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {(!collapsed || mobile) && (
                  <span className="text-sm font-medium truncate">
                    {lang === "ar" ? item.labelAr : item.labelEn}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
        {(!collapsed || mobile) && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <Link href="/" className="ms-auto">
              <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent h-8 text-xs">
                {t("المتجر", "Store")}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar border-e border-sidebar-border transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute start-0 top-0 bottom-0 bg-sidebar border-e border-sidebar-border flex flex-col">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <Gift className="w-5 h-5 text-primary" />
          <span className="font-bold font-serif text-primary">{t("هدايا — الإدارة", "Hadaya Admin")}</span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
