import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <div className="bg-destructive text-destructive-foreground text-center py-2 px-4 text-sm font-medium sticky top-0 z-[60]">
        If you are in crisis, call or text 988 — Suicide and Crisis Lifeline
      </div>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
