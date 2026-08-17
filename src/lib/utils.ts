import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a short, user-facing message from a thrown error.
 *
 * Convex wraps server errors sent to the client as:
 *   "[CONVEX A(action:name)] [Request ID: …] Server Error Uncaught Error: <msg> Called by client"
 * so strip the wrapper and keep only the actual message. Errors without the
 * wrapper (network failures, plain Errors) are returned as-is, trimmed.
 */
export function friendlyErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : "";
  if (!raw) return fallback;

  let msg = raw;
  const start = msg.indexOf("Uncaught Error: ");
  if (start >= 0) msg = msg.slice(start + "Uncaught Error: ".length);
  const suffix = msg.lastIndexOf(" Called by client");
  if (suffix >= 0) msg = msg.slice(0, suffix);
  msg = msg.trim();

  return msg || fallback;
}
