/** A single line in the customer's cart. */
export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

/** Adds a line (or bumps the quantity of an existing one). */
export function addLine(
  lines: CartLine[],
  id: string,
  name: string,
  price: number,
  qty = 1,
): CartLine[] {
  const existing = lines.find((line) => line.id === id);
  if (existing) {
    return lines.map((line) =>
      line.id === id ? { ...line, qty: line.qty + qty, price } : line,
    );
  }
  return [...lines, { id, name, price, qty }];
}

/** Sets a line's quantity; a qty of 0 or less removes the line. */
export function setLineQty(lines: CartLine[], id: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((line) => line.id !== id);
  return lines.map((line) => (line.id === id ? { ...line, qty } : line));
}

/** Removes a line entirely. */
export function removeLine(lines: CartLine[], id: string): CartLine[] {
  return lines.filter((line) => line.id !== id);
}

/** Total number of items across all lines. */
export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

/** Total price of all lines (₹). */
export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.qty, 0);
}
