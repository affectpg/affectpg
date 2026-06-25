import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src="/apg-logo.png" alt="APG Logo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-serif font-bold leading-none text-lg">Just For Us</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium leading-none mt-1">By APG</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/forum" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Forum
          </Link>
          <div className="h-4 w-px bg-border"></div>
          <Link href="/new-thread">
            <Button size="sm" className="font-semibold shadow-sm">
              Start a Conversation
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2 -mr-2 text-foreground" onClick={() => setIsOpen(!isOpen)} data-testid="button-mobile-menu">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          <Link href="/" className="block text-sm font-medium text-foreground py-2" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/forum" className="block text-sm font-medium text-foreground py-2" onClick={() => setIsOpen(false)}>
            Forum
          </Link>
          <div className="pt-2">
            <Link href="/new-thread" onClick={() => setIsOpen(false)}>
              <Button className="w-full font-semibold">Start a Conversation</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
