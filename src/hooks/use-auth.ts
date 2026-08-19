import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile, type User } from "@/lib/db";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  });

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setState({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    const profile = await ensureUserProfile();
    setState({
      isLoading: false,
      isAuthenticated: true,
      user: profile,
    });
  }, []);

  useEffect(() => {
    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      await refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(
    async (provider?: string, email?: string, password?: string) => {
      if (provider === "google") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
      } else if (email && password) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await refresh();
      }
    },
    [refresh],
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState({ isLoading: false, isAuthenticated: false, user: null });
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  };
}
