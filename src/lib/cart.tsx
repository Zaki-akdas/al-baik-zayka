import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addLine,
  cartCount,
  cartTotal,
  removeLine,
  setLineQty,
  type CartLine,
} from "./cart-utils";

export type { CartLine };

interface CartContextValue {
  items: CartLine[];
  count: number;
  total: number;
  add: (id: string, name: string, price: number, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((id: string, name: string, price: number, qty = 1) => {
    setItems((prev) => addLine(prev, id, name, price, qty));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => setLineQty(prev, id, qty));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => removeLine(prev, id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => cartCount(items), [items]);

  const total = useMemo(() => cartTotal(items), [items]);

  const value = useMemo(
    () => ({ items, count, total, add, setQty, remove, clear, isOpen, setIsOpen }),
    [items, count, total, add, setQty, remove, clear, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
