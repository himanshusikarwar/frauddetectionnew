"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { setAuthCookie } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDemoLogin = async () => {
    const user = {
      id: "demo-user-1",
      name: "Demo Student",
      email: "demo@study.local",
    };
    loginDemo(user);
    await setAuthCookie(user.id);
    router.push("/dashboard");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const user = {
      id: "local-" + Date.now(),
      name: email.split("@")[0],
      email: email.trim(),
    };
    loginDemo(user);
    await setAuthCookie(user.id);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use demo or enter email to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={!email.trim()}>
            Sign in
          </Button>
        </form>
        <div className="relative">
          <span className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </span>
          <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
            or
          </span>
        </div>
        <Button variant="outline" className="w-full" onClick={handleDemoLogin}>
          Continue as Demo
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
