/**
 * Programmatic email-OTP sign-in against the local Convex backend.
 *
 * Replicates exactly what the app's /auth page does (calls the `auth:signIn`
 * action twice — initiate, then verify with the code) but reads the code from
 * the local `authVerificationCodes` table instead of an inbox, so the whole
 * flow completes headlessly.
 */
import { findValidCodes } from "./otp.mjs";

/**
 * Sign in as `email` and return the authenticated client.
 *
 * @param {import("convex/browser").ConvexHttpClient} client - unauthenticated client
 * @param {string} email
 * @returns {Promise<{ email: string, code: string }>}
 */
export async function signInWithEmail(client, email) {
  // Initiate sign-in. The verification-code row is created server-side even if
  // the email send fails (e.g. example.com), so ignore send errors.
  try {
    await client.action("auth:signIn", {
      provider: "email-otp",
      params: { email },
    });
  } catch {
    // ignore — the code is stored regardless
  }

  const codes = findValidCodes(email).filter((c) => !c.expired);
  if (codes.length === 0) {
    throw new Error(
      `No fresh verification code found for "${email}". Is the local Convex backend running?`,
    );
  }
  const code = codes[0].code;

  const result = await client.action("auth:signIn", {
    provider: "email-otp",
    params: { email, code },
  });
  const token = result?.tokens?.token;
  if (!token) {
    throw new Error(`Sign-in for "${email}" succeeded but returned no token.`);
  }
  client.setAuth(token);
  return { email, code };
}
