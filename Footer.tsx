export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-xs space-y-4">
          <div className="flex items-center gap-3">
            <img src="/apg-logo.png" alt="APG Logo" className="h-10 w-10 object-contain grayscale opacity-70" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-foreground">Just For Us</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Affect Philanthropy Group</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            A safe house for candid, judgment-free connection. No one should feel restricted from getting help based on their economic or social class.
          </p>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Crisis Resources</p>
          <p>If you are in crisis, please get help immediately.</p>
          <div className="mt-2 p-3 bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
            Call or text 988 — Suicide & Crisis Lifeline
          </div>
        </div>
      </div>
      
      <div className="border-t border-border py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Affect Philanthropy Group. Orange County, CA.
        </div>
      </div>
    </footer>
  );
}
