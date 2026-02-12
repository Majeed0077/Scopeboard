"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor";
  avatarUrl?: string;
  timezone?: string;
  language?: string;
};

const timezones = ["UTC", "Asia/Karachi", "Asia/Dubai", "Europe/London", "America/New_York"];
const languages = [
  { value: "en", label: "English" },
  { value: "ur", label: "Urdu" },
];

export function ProfileClient({ initialProfile }: { initialProfile?: Profile | null }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [name, setName] = useState(initialProfile?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl ?? "");
  const [timezone, setTimezone] = useState(initialProfile?.timezone ?? "UTC");
  const [language, setLanguage] = useState(initialProfile?.language ?? "en");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.success || !data.data) return;
        setProfile(data.data);
        setName(data.data.name ?? "");
        setAvatarUrl(data.data.avatarUrl ?? "");
        setTimezone(data.data.timezone ?? "UTC");
        setLanguage(data.data.language ?? "en");
      })
      .catch(() => undefined);
  }, []);

  async function handleUpload(file: File) {
    const form = new FormData();
    form.append("files", file);
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success || !payload?.data?.length) {
      throw new Error(payload?.error ?? "Upload failed");
    }
    return payload.data[0]?.url as string;
  }

  async function persistProfile(nextName: string, nextAvatarUrl: string) {
    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextName.trim(),
        avatarUrl: nextAvatarUrl,
        timezone,
        language,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error ?? "Unable to update profile.");
    }

    setProfile(payload.data);
    window.dispatchEvent(new Event("scopeboard-profile-updated"));
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    try {
      await persistProfile(name, avatarUrl);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-2xl border bg-card/60 px-6 py-5">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal account details and identity across the workspace.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-6 rounded-xl border bg-background/60 p-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Profile photo</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
                  Upload photo
                </Button>
                {avatarUrl ? (
                  <Button type="button" variant="ghost" onClick={() => setAvatarUrl("")}>
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP. URL is stored in DB.</p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const url = await handleUpload(file);
                setAvatarUrl(url);
                await persistProfile(name || profile?.name || "User", url);
                toast.success("Photo uploaded.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Upload failed.");
              } finally {
                event.target.value = "";
              }
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile?.role ? profile.role.toUpperCase() : ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="min-w-32" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm font-medium">Account snapshot</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{name || "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">{profile?.role?.toUpperCase() ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Timezone</dt>
                <dd className="font-medium">{timezone}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Language</dt>
                <dd className="font-medium">
                  {languages.find((item) => item.value === language)?.label ?? language}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium">Tips</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>Use a clear profile photo for quick team recognition.</li>
              <li>Set timezone correctly for reminders and due dates.</li>
              <li>Keep name consistent for audit and activity logs.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
