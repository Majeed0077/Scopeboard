"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type NotificationPrefs = {
  inviteEmail: boolean;
  inviteInApp: boolean;
  taskDueEmail: boolean;
  taskDueInApp: boolean;
  mentionEmail: boolean;
  mentionInApp: boolean;
  invoiceEmail: boolean;
  invoiceInApp: boolean;
};

type AccountProfile = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor";
  timezone?: string;
  language?: string;
  defaultLandingPage?: "today" | "dashboard";
  compactMode?: boolean;
  keyboardShortcuts?: boolean;
  signature?: string;
  lastLoginAt?: string | null;
  notificationPrefs?: NotificationPrefs;
};

type SettingsTab = "security" | "notifications" | "preferences";

const defaultPrefs: NotificationPrefs = {
  inviteEmail: true,
  inviteInApp: true,
  taskDueEmail: true,
  taskDueInApp: true,
  mentionEmail: true,
  mentionInApp: true,
  invoiceEmail: true,
  invoiceInApp: true,
};

const prefLabels: Record<keyof NotificationPrefs, string> = {
  inviteEmail: "Invite emails",
  inviteInApp: "Invite in-app",
  taskDueEmail: "Task due emails",
  taskDueInApp: "Task due in-app",
  mentionEmail: "Mention emails",
  mentionInApp: "Mention in-app",
  invoiceEmail: "Invoice emails",
  invoiceInApp: "Invoice in-app",
};

function getPasswordStrength(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 1) return { score, label: "Weak", className: "bg-red-500" };
  if (score === 2) return { score, label: "Fair", className: "bg-amber-500" };
  if (score === 3) return { score, label: "Good", className: "bg-yellow-500" };
  return { score, label: "Strong", className: "bg-emerald-500" };
}

export function AccountSettingsClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("security");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [timezone, setTimezone] = useState("UTC");
  const [language, setLanguage] = useState("en");
  const [defaultLandingPage, setDefaultLandingPage] = useState<"today" | "dashboard">("today");
  const [compactMode, setCompactMode] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [signature, setSignature] = useState("");
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.success || !data.data) return;
        setProfile(data.data);
        setTimezone(data.data.timezone ?? "UTC");
        setLanguage(data.data.language ?? "en");
        setDefaultLandingPage(data.data.defaultLandingPage === "dashboard" ? "dashboard" : "today");
        setCompactMode(Boolean(data.data.compactMode));
        setKeyboardShortcuts(data.data.keyboardShortcuts !== false);
        setSignature(data.data.signature ?? "");
        setPrefs({ ...defaultPrefs, ...(data.data.notificationPrefs ?? {}) });
      })
      .catch(() => undefined);
  }, []);

  async function savePreferences() {
    setSavingPrefs(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          language,
          defaultLandingPage,
          compactMode,
          keyboardShortcuts,
          signature,
          notificationPrefs: prefs,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Unable to save settings.");
      }

      setProfile(payload.data);
      toast.success("Account settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Unable to change password.");
      }

      toast.success("Password updated. You have been logged out from all devices.");
      router.push("/signin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogoutAllDevices() {
    setLoggingOutAll(true);
    try {
      const response = await fetch("/api/users/me/sessions", { method: "POST" });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error ?? "Unable to logout all sessions.");
      }
      toast.success("All sessions logged out.");
      router.push("/signin");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to logout all sessions.");
    } finally {
      setLoggingOutAll(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-2xl border bg-card/60 px-6 py-5">
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Security, notifications, and personal preferences.
        </p>
      </div>

      <div className="inline-flex w-full max-w-xl rounded-xl border bg-card p-1">
        {(["security", "notifications", "preferences"] as SettingsTab[]).map((tab) => (
          <Button
            key={tab}
            type="button"
            variant="ghost"
            className={cn("h-9 flex-1 text-sm capitalize", activeTab === tab && "bg-muted")}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {activeTab === "security" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Login and security</h2>
                <p className="text-xs text-muted-foreground">
                  Last login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Not available"}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogoutAllDevices} disabled={loggingOutAll}>
                {loggingOutAll ? "Logging out..." : "Logout all devices"}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Current password</Label>
                <div className="flex gap-2">
                  <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => setShowCurrent((prev) => !prev)}>{showCurrent ? "Hide" : "Show"}</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <div className="flex gap-2">
                  <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => setShowNew((prev) => !prev)}>{showNew ? "Hide" : "Show"}</Button>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded bg-muted">
                    <div className={strength.className} style={{ width: `${(strength.score / 4) * 100}%`, height: "100%" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Strength: {strength.label}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm new password</Label>
                <div className="flex gap-2">
                  <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <Button type="button" variant="outline" onClick={() => setShowConfirm((prev) => !prev)}>{showConfirm ? "Hide" : "Show"}</Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={changingPassword}>{changingPassword ? "Updating..." : "Update password"}</Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-5">
            <p className="text-sm font-medium">Security guidance</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Use at least 8 characters with mixed case and symbols.</li>
              <li>Avoid reusing passwords across work and personal apps.</li>
              <li>Use "Logout all devices" if account activity looks suspicious.</li>
            </ul>
          </Card>
        </div>
      ) : null}

      {activeTab === "notifications" ? (
        <Card className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Notification preferences</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(prefs) as Array<keyof NotificationPrefs>).map((key) => (
              <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{prefLabels[key]}</span>
                <Button
                  type="button"
                  size="sm"
                  variant={prefs[key] ? "default" : "outline"}
                  onClick={() => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
                >
                  {prefs[key] ? "On" : "Off"}
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={savingPrefs}>{savingPrefs ? "Saving..." : "Save notifications"}</Button>
          </div>
        </Card>
      ) : null}

      {activeTab === "preferences" ? (
        <Card className="space-y-4 p-6">
          <h2 className="text-base font-semibold">Personal preferences</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Default landing page</Label>
              <Select value={defaultLandingPage} onValueChange={(value) => setDefaultLandingPage(value as "today" | "dashboard")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Asia/Karachi">Asia/Karachi</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Display preferences</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant={compactMode ? "default" : "outline"} onClick={() => setCompactMode((prev) => !prev)}>
                  Compact mode
                </Button>
                <Button type="button" variant={keyboardShortcuts ? "default" : "outline"} onClick={() => setKeyboardShortcuts((prev) => !prev)}>
                  Shortcuts
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Signature block</Label>
            <p className="text-xs text-muted-foreground">Used in invoice and message templates.</p>
            <Textarea rows={4} value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Regards,\nYour Name\nScopeBoard" />
          </div>
          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={savingPrefs}>{savingPrefs ? "Saving..." : "Save preferences"}</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
