import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-10 pt-4 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <span>© 2026 ScopeBoard. Built for agency operators.</span>
        <div className="flex items-center gap-4">
          <Link href="#home">Home</Link>
          <Link href="#services">Services</Link>
          <Link href="#about">About</Link>
        </div>
      </div>
    </footer>
  );
}

