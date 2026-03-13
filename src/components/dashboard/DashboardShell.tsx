"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { clearAuthCookie } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Sun,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/schedule/create", label: "Create schedule", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Please sign in to continue.</p>
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-card transform transition-transform md:translate-x-0 md:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <Link href="/dashboard" className="font-semibold text-lg">
              Study Schedule
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground truncate px-2">{user.name || user.email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mt-2"
              onClick={async () => {
                await clearAuthCookie();
                logout();
                window.location.href = "/";
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
      {!mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed top-4 left-4 z-30 rounded-md p-2 bg-card border shadow"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}
