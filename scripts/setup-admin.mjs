/**
 * Promote a user to admin in the local Convex deployment.
 *
 * Usage:
 *   node scripts/setup-admin.mjs <email>               # promote <email> (it must already be admin, or no admin may exist)
 *   node scripts/setup-admin.mjs <email> --as <admin>  # authorize as the current admin, then promote <email>
 *
 * The script signs in headlessly via the email-OTP flow (code recovered from
 * the local DB), so it works with the admin-guarded resetAdmin mutation.
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
  const args = process.argv.slice(2);
  const email = args.find((a) => !a.startsWith("--"));
  const asIdx = args.indexOf("--as");
  const asAdmin = asIdx >= 0 ? args[asIdx + 1] : null;

  if (!email) {
    console.error("Usage: node scripts/setup-admin.mjs <email> [--as <current-admin-email>]");
    process.exit(1);
  }

  if (!process.env.VITE_CONVEX_URL) {
    console.error("Error: VITE_CONVEX_URL is not set (check .env.local).");
    process.exit(1);
  }

  const url = process.env.VITE_CONVEX_URL;
  const anon = new ConvexHttpClient(url);

  try {
    // Figure out the starting state.
    const status = await anon.query("roles:roleStatus", {});
    const authEmail = asAdmin ?? email;

    // Sign in headlessly as whoever authorizes the change.
    const client = new ConvexHttpClient(url);
    const { code } = await signInWithEmail(client, authEmail);
    console.log(`Signed in as ${authEmail} (OTP ${code}, recovered from the local DB)`);

    if (status.adminExists) {
      console.log("Resetting admin roles...");
      try {
        const resetResult = await client.mutation("roles:resetAdmin", {});
        console.log(`  Cleared ${resetResult.cleared} admin(s)`);
      } catch (err) {
        if (String(err.message).includes("Admins only")) {
          console.error(
            `❌ ${authEmail} is not an admin, so it cannot reset the current admins.`,
          );
          console.error(
            `   Re-run with --as <current-admin-email>, or promote ${email} from the admin panel first.`,
          );
          process.exit(1);
        }
        throw err;
      }
    } else {
      console.log("No admin exists yet — skipping reset.");
    }

    console.log(`Setting ${email} as admin...`);
    const createResult = await client.mutation("roles:createAdminAccount", {
      email,
    });
    console.log(`  Done! userId: ${createResult.userId}`);

    console.log("\n✅ Admin setup complete!");
    console.log(`   Email: ${email}`);
    console.log("   Refresh http://localhost:5173/admin to see the panel.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("not found")) {
      console.error("❌ That email hasn't signed in yet — accounts are created on first sign-in.");
      console.error(`   1. Open http://localhost:5173/auth and sign in with ${email}`);
      console.error(`   2. Get the code: node scripts/get-otp.mjs ${email}`);
      console.error(`   3. Rerun:        node scripts/setup-admin.mjs ${email}`);
    } else {
      console.error("❌ Failed:", message);
    }
    process.exit(1);
  }
}

main();
