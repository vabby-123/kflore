"use client";

import * as React from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variant?: string | null;
  price: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string | null) => void;
  updateQuantity: (productId: string, variant: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);
const STORAGE_KEY = "kflore-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // One-time hydration from localStorage on mount (client-only; avoids SSR hydration mismatch).
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart still works for this session
    }
  }, [items, hydrated]);

  const addItem = React.useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && p.variant === item.variant);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const removeItem = React.useCallback((productId: string, variant?: string | null) => {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && p.variant === variant)));
  }, []);

  const updateQuantity = React.useCallback(
    (productId: string, variant: string | null | undefined, quantity: number) => {
      setItems((prev) =>
        prev.map((p) =>
          p.productId === productId && p.variant === variant ? { ...p, quantity: Math.max(1, quantity) } : p
        )
      );
    },
    []
  );

  const clearCart = React.useCallback(() => setItems([]), []);

  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    [items, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
