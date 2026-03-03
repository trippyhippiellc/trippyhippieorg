"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/useCart";
import type { Product } from "@/types/supabase";

/*
  AddToCartButton — main CTA on product detail page.
  Passes the full Product object to addItem() as the cart store expects.
*/

interface AddToCartButtonProps {
  product: Product;
  quantity: number;
  maxAvailable?: number;
  variantId?: string | null;
  onInventoryWarning?: (maxAvailable: number) => void;
  className?: string;
}

export function AddToCartButton({ 
  product, 
  quantity, 
  maxAvailable = 0,
  variantId,
  onInventoryWarning,
  className 
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    // Check if quantity exceeds available stock
    if (maxAvailable > 0 && quantity > maxAvailable) {
      onInventoryWarning?.(maxAvailable);
      return;
    }

    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const outOfStock = maxAvailable <= 0;

  return (
    <Button
      variant="primary"
      size="xl"
      onClick={handleAdd}
      disabled={outOfStock}
      className={className}
      leftIcon={
        added
          ? <Check className="h-5 w-5" />
          : <ShoppingCart className="h-5 w-5" />
      }
    >
      {outOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
    </Button>
  );
}

export default AddToCartButton;
