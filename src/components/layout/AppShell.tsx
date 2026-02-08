import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AppProviders } from "@/components/layout/AppProviders";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-muted/30 px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
