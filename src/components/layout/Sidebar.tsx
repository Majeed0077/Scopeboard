"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Layers,
  Users,
  FolderKanban,
  Receipt,
  CalendarCheck,
  ShieldCheck,
  Settings,
  UsersRound,
  CreditCard,
  Database,
  Upload,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/useRole";
import { useLocalData } from "@/lib/localDataStore";
import { toast } from "sonner";

const navItems = [
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/crm", label: "Pipeline", icon: Layers },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/invoices", label: "Invoices", icon: Receipt },
];

const ownerItems = [
  { href: "/audit", label: "Audit Log", icon: ShieldCheck },
  { href: "/admin/users", label: "Team", icon: UsersRound },
  { href: "/admin/settings", label: "Admin Settings", icon: Settings },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/backup", label: "Backup", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useRole();
  const isOwner = role === "owner";
  const { contacts, projects, milestones, invoices } = useLocalData();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background px-4 py-6">
      <div className="flex items-center px-2">
        <div className="flex h-12 w-[200px] items-center justify-start rounded-xl bg-background">
          <Image
            src="/Logo.png"
            alt="VaultFlow"
            width={200}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {isOwner &&
          ownerItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
        <p className="text-sm font-semibold text-foreground">Team Pulse</p>
        <p className="mt-2">3 proposals awaiting approval.</p>
        <p className="mt-1">2 invoices overdue.</p>
      </div>

      {isOwner && (
        <div className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => {
              const data = { contacts, projects, milestones, invoices };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "vaultflow-data.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Export data
          </Button>
          <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 cursor-pointer">
            <Upload className="h-4 w-4" />
            Import data
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const parsed = JSON.parse(reader.result as string);
                    toast.message("Import is not available in live mode.");
                  } catch {
                    toast.error("Invalid data file.");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
      )}
    </aside>
  );
}
