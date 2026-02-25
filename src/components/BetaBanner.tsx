import { useState } from "react";
import { X } from "lucide-react";

const BetaBanner = () => {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("beta-dismissed") === "true");

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("beta-dismissed", "true");
    setDismissed(true);
  };

  return (
    <div className="bg-accent/10 border-b border-accent/20 text-foreground/80 text-sm py-2 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-center flex-1">
          Record Tracer is currently in beta testing. We are actively improving features and performance. Thank you for being an early supporter.
        </p>
        <button onClick={handleDismiss} className="shrink-0 p-1 hover:text-foreground transition-colors" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BetaBanner;
