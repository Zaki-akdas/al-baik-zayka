/**
 * Shared OTP recovery helpers for the local Convex dev backend.
 *
 * The local email-OTP provider stores a SHA-256 hash of the 6-digit code in
 * the `authVerificationCodes` system table, so the code can only be read by
 * brute-forcing it against the hash — which is what `crackCode` does.
 *
 * Shells out to `npx convex data` (same command as `npx convex dev`), so the
 * local backend must be running.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

// The child-process arg-escaping warning is expected here (npx needs a shell on Windows).
process.noDeprecation = true;

export function sha256hex(s) {
  return createHash("sha256").update(s).digest("hex");
}

/** Crack a 6-digit code from its SHA-256 hash (~1-2s per token). */
export function crackCode(hash) {
  for (let i = 0; i < 1_000_000; i++) {
    const candidate = String(i).padStart(6, "0");
    if (sha256hex(candidate) === hash) return candidate;
  }
  return null;
}

function runConvexData(table) {
  const env = { ...process.env, CONVEX_AGENT_MODE: "anonymous" };
  // This machine's npm spawns cmd.exe via COMSPEC, which points at a missing
  // System32 path — point it at the working copy instead.
  if (process.platform === "win32") {
    env.COMSPEC = "C:\\Windows\\SysWOW64\\cmd.exe";
  }
  const out = execFileSync("npx", ["convex", "data", table, "--limit", "30"], {
    env,
    encoding: "utf-8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return out;
}

function parseTable(out) {
  const lines = out.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split("|").map((s) => s.trim());
  const idx = (name) => header.indexOf(name);
  const cols = {
    email: idx("emailVerified"),
    code: idx("code"),
    exp: idx("expirationTime"),
    created: idx("_creationTime"),
    provider: idx("provider"),
  };
  if (cols.email < 0 || cols.code < 0) return [];
  return lines.slice(2).map((line) => {
    const parts = line.split("|").map((s) => s.trim().replace(/^"|"$/g, ""));
    return {
      email: (parts[cols.email] || "").toLowerCase(),
      codeHash: parts[cols.code] || "",
      expiresAt: Number(parts[cols.exp] || 0),
      createdAt: Number(parts[cols.created] || 0),
      provider: parts[cols.provider] || "",
    };
  });
}

/** Raw verification-code rows from the local backend. */
export function getVerificationCodes() {
  const out = runConvexData("authVerificationCodes");
  return parseTable(out);
}

/**
 * Crack codes for one email (or all emails when `email` is omitted).
 * Returns rows like { email, code, expiresAt, expired }.
 */
export function findValidCodes(email) {
  const rows = getVerificationCodes().filter(
    (r) => r.codeHash && (!email || r.email === email.toLowerCase()),
  );
  const now = Date.now();
  const results = [];
  for (const row of rows) {
    const code = crackCode(row.codeHash);
    if (!code) continue;
    results.push({
      email: row.email,
      code,
      expiresAt: row.expiresAt,
      expired: row.expiresAt < now,
    });
  }
  return results;
}
