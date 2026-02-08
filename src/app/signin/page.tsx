"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingRole, setExistingRole] = useState<"owner" | "editor" | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.data?.role) {
          setExistingRole(data.data.role);
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok || !payload?.success) {
      toast.error(payload?.error ?? "Invalid email or password.");
      return;
    }

    const me = await fetch("/api/auth/me").then((res) => res.json()).catch(() => null);
    const role = me?.data?.role;
    if (role === "owner") router.push("/owner");
    else router.push("/editor");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
      <Card className="w-full max-w-md space-y-6 p-8">
        <div>
          <p className="text-sm text-muted-foreground">VaultFlow</p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">Use your account to continue.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        {existingRole ? (
          <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
            You are already signed in.
            <Button
              variant="link"
              className="px-1 text-xs"
              onClick={() => router.push(existingRole === "owner" ? "/owner" : "/editor")}
            >
              Go to dashboard
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
