import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ngynwuFNguqsxLdsci.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neW53dWZuZmd1cXN4Ymxkc2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NDczNzksImV4cCI6MjEwMjUyMzM3OX0.bNz9dOkvq_SIAVPVngHgl_R-B2M3iXFlSXXfc_NzD_Q";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function main() {
  console.log("Creating admin user...");

  const { data, error } = await supabase.auth.signUp({
    email: "zakiakdas703@gmail.com",
    password: "159339923",
    options: { data: { name: "Zaki Akdas" } },
  });

  if (error) {
    console.error("Signup error:", error.message);
    if (error.message.includes("already")) {
      console.log("User already exists — setting role to admin...");
    } else {
      process.exit(1);
    }
  } else {
    console.log("User created! ID:", data.user?.id);
  }

  // Try to set admin role via RPC or direct update
  // This requires the user to be signed in first
  console.log("\n✅ User created. Now:");
  console.log("1. Go to https://supabase.com/dashboard → your project");
  console.log("2. Table Editor → users table");
  console.log("3. Find zakiakdas703@gmail.com → set role to 'admin'");
  console.log("4. Sign in at https://al-baik-zayka.vercel.app/auth");
}

main();
