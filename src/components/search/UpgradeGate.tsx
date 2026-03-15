import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TierKey } from "@/contexts/AuthContext";
import { TIERS } from "@/contexts/AuthContext";

interface UpgradeGateProps {
  requiredTier: TierKey;
  featureName: string;
  children: React.ReactNode;
  hasAccess: boolean;
}

const UpgradeGate = ({ requiredTier, featureName, children, hasAccess }: UpgradeGateProps) => {
  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none opacity-20 blur-[2px] p-4">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 p-6">
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {featureName} requires {TIERS[requiredTier].name} plan
        </h3>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-sm">
          Upgrade to the {TIERS[requiredTier].name} plan (${TIERS[requiredTier].price}/mo) to unlock {featureName.toLowerCase()}.
        </p>
        <Link to="/pricing">
          <Button size="sm" className="gap-1.5">
            View Plans
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UpgradeGate;
