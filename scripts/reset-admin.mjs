/**
 * Clear the admin role from every user in the local Convex deployment.
 *
 * Usage: node scripts/reset-admin.mjs <admin-email>
 *
 * resetAdmin is admin-guarded, so this script signs in headlessly as the given
 * admin (OTP recovered from the local DB) before clearing the roles.
 *
 * Requires the local Convex dev backend to be running.
 */
import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { signInWithEmail } from "./lib/signin.mjs";

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

async function main() {
  const adminEmail = process.argv[2];

  if (!adminEmail) {
    console.error("Usage: node scripts/reset-admin.mjs <admin-email>");
    process.exit(1);
  }

  if (!process.env.VITE_CONVEX_URL) {
    console.error("Error: VITE_CONVEX_URL is not set (check .env.local).");
    process.exit(1);
  }

  const url = process.env.VITE_CONVEX_URL;
  const anon = new ConvexHttpClient(url);

  try {
    const status = await anon.query("roles:roleStatus", {});
    if (!status.adminExists) {
      console.log("No admins to reset — the admin role is already clear.");
      return;
    }

    const client = new ConvexHttpClient(url);
    const { code } = await signInWithEmail(client, adminEmail);
    console.log(`Signed in as ${adminEmail} (OTP ${code}, recovered from the local DB)`);

    const result = await client.mutation("roles:resetAdmin", {});
    console.log(`✅ Admin reset complete. Cleared ${result.cleared} admin(s).`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Admins only")) {
      console.error(
        `❌ ${adminEmail} is not an admin. Pass an existing admin's email to reset roles.`,
      );
    } else {
      console.error("❌ Failed:", message);
    }
    process.exit(1);
  }
}

main();
