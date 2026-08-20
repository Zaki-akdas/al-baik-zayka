import { restaurant } from "@/data/restaurant";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

/** Builds a wa.me link with the given pre-filled message. */
export function waLink(message: string): string {
  return `https://wa.me/${restaurant.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

export const telLink = `tel:${restaurant.phoneIntl}`;

export const generalOrderMessage = `Hello ${restaurant.name} 👋

I would like to place an order.

Items:
1. 
2. 

Quantity:
Delivery / Pickup:

Name:
Address:

Please confirm availability and total amount.`;

export function cartOrderMessage(lines: CartLine[]): string {
  const items = lines
    .map((line, i) => `${i + 1}. ${line.name} × ${line.qty}`)
    .join("\n");
  return `Hello ${restaurant.name} 👋

I would like to place an order.

Items:
${items}

Quantity:
Delivery / Pickup:

Name:
Address:

Please confirm availability and total amount.`;
}

export function itemOrderMessage(name: string): string {
  return `Hello ${restaurant.name} 👋

I would like to order:

${name}

Please confirm price and availability.

Name:
Address:`;
}

export function offerOrderMessage(title: string): string {
  return `Hello ${restaurant.name} 👋

I'm interested in the "${title}" combo/offer.

Please share details and availability.

Name:
Address:`;
}
