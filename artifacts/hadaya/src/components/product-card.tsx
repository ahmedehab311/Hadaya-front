import { Link } from "wouter";
import { ShoppingCart, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const name = lang === "ar" ? product.nameAr : product.nameEn;

  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="group bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl || "https://placehold.co/400x400/f5e8d8/9b6b52?text=Hadaya"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-sm font-medium text-foreground bg-muted px-3 py-1 rounded-full">
                {t("نفدت الكمية", "Out of Stock")}
              </span>
            </div>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 start-2 bg-primary text-primary-foreground text-xs">
              {t("مميز", "Featured")}
            </Badge>
          )}
        </div>
        <div className="p-4">
          {product.collectionName && (
            <p className="text-xs text-muted-foreground mb-1">{product.collectionName}</p>
          )}
          <h3 className="font-semibold text-foreground leading-tight mb-2 line-clamp-2">{name}</h3>
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
              {Number(product.price).toFixed(2)} {t("ر.س", "SAR")}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="shrink-0 transition-all"
              data-testid={`button-add-cart-${product.id}`}
            >
              {added ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
