/**
 * Diagnose the admin/role state of the local Convex deployment.
 *
 * Usage: node scripts/diagnose-admin.mjs
 *
 * Shows the public role status, plus the full user list when called with an
 * admin session (listUsers is admin-only; without one it is skipped).
 *
 * Requires the local Convex dev backend to be running.
 */
import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";

function loadEnv() {
  try {
    const env = readFileSync(".env.local", "utf-8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && rest.length) {
        const value = rest.join("=").replace(/^["']|["']$/g, "");
        process.env[key.trim()] = value.trim();
      }
    }
  } catch {
    // ignore
  }
}

loadEnv();

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function main() {
  if (!process.env.VITE_CONVEX_URL) {
    console.error("Error: VITE_CONVEX_URL is not set (check .env.local).");
    process.exit(1);
  }

  try {
    // Public — works without a session.
    const status = await client.query("roles:roleStatus", {});
    console.log("Role status:");
    console.log(`  adminExists: ${status.adminExists}`);
    console.log(`  isAdmin:     ${status.isAdmin}`);
    console.log(`  isDelivery:  ${status.isDelivery}`);
    console.log(`  role:        ${status.role ?? "none"}`);

    // Admin-only — best effort.
    try {
      const users = await client.query("roles:listUsers", {});
      console.log("\nAll users:");
      users.forEach((u) => {
        console.log(
          `  - ${u.email || "(no email)"} | role: ${u.role || "none"} | _id: ${u._id}`,
        );
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(
        `\n(Users list skipped: ${message} — run from an admin session to list users.)`,
      );
    }
  } catch (err) {
    console.error(
      "❌ Failed:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
}

main();
