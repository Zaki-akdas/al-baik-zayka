/**
 * Recover the current email-OTP code for the local Convex deployment.
 *
 * Usage:
 *   node scripts/get-otp.mjs                # show codes for every recent token
 *   node scripts/get-otp.mjs me@example.com # only tokens for this email
 *
 * Requires the local Convex dev backend to be running.
 */
import { findValidCodes } from "./lib/otp.mjs";

const targetEmail = process.argv[2];

function main() {
  const results = findValidCodes(targetEmail);

  if (results.length === 0) {
    console.log(
      targetEmail
        ? `No verification codes found for "${targetEmail}". Request a new code first (sign in on /auth).`
        : "No verification codes found. Request a new code first (sign in on /auth).",
    );
    return;
  }

  const now = Date.now();
  let found = 0;
  for (const row of results) {
    found++;
    const minsLeft = Math.max(0, Math.round((row.expiresAt - now) / 60000));
    console.log(
      `${row.email}  ->  OTP: ${row.code}  (${row.expired ? "EXPIRED" : `${minsLeft} min left`})`,
    );
  }
  if (found === 0) {
    console.log("No codes could be cracked (no unexpired tokens matched).");
  }
}

main();
