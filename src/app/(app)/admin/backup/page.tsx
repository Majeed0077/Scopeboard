import { AdminBackupPanel } from "@/components/admin/AdminBackupPanel";

export default function AdminBackupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Backup</h1>
        <p className="text-sm text-muted-foreground">
          Owner-only data export and restore.
        </p>
      </div>
      <AdminBackupPanel />
    </div>
  );
}
