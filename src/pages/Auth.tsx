import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
      } else {
        await signIn(undefined, email, password);
      }
      navigate(redirect);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md border-border shadow-md">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="Al-Baik Zayka"
              width={64}
              height={64}
              className="mb-4 mt-2 cursor-pointer rounded-lg"
              onClick={() => navigate("/")}
            />
          </div>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "signin"
              ? "Sign in to your account"
              : "Sign up to start ordering"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-foreground/80">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-6">
            <Button
              type="submit"
              className="h-11 w-full bg-gold text-[#3a2403] hover:bg-gold-bright"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Mail className="mr-2 size-4" />
              )}
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              disabled={isLoading}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </form>

        <div className="border-t border-border bg-muted/50 px-6 py-4 text-center text-xs text-muted-foreground rounded-b-lg">
          Secured by{" "}
          <a
            href="https://freebuff.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-foreground"
          >
            freebuff.com
          </a>
        </div>
      </Card>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
