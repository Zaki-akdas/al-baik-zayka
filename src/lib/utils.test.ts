import { describe, expect, it } from "vitest";

import { friendlyErrorMessage } from "./utils";

describe("friendlyErrorMessage", () => {
  it("strips the Convex wrapper from an action error", () => {
    const err = new Error(
      "[CONVEX A(supabase:syncOrders)] [Request ID: ccb13962fcfa759a] Server Error Uncaught Error: DATABASE_URL is not set in the project Keys tab Called by client",
    );
    expect(friendlyErrorMessage(err, "fallback")).toBe(
      "DATABASE_URL is not set in the project Keys tab",
    );
  });

  it("handles the wrapped format with a trailing newline before the suffix", () => {
    const err = new Error(
      "[CONVEX M(roles:bootstrapAdmin)] [Request ID: 50bf900401d2c81f] Server Error\nUncaught Error: Sign in first\n  Called by client",
    );
    expect(friendlyErrorMessage(err, "fallback")).toBe("Sign in first");
  });

  it("returns plain error messages as-is", () => {
    expect(friendlyErrorMessage(new Error("Network is down"), "fallback")).toBe(
      "Network is down",
    );
  });

  it("falls back when the message is empty or not an Error", () => {
    expect(friendlyErrorMessage(new Error("   "), "fallback")).toBe("fallback");
    expect(friendlyErrorMessage("not an error", "fallback")).toBe("fallback");
    expect(friendlyErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});
