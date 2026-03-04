import { TrendingUp, TrendingDown } from "lucide-react";
import type { TopActor } from "./types";

interface TopEntitiesProps {
  actors: TopActor[];
}

const TopEntities = ({ actors }: TopEntitiesProps) => {
  if (actors.length === 0) return null;

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-foreground">
        <span className="text-xl">🏆</span>
        <h3 className="font-bold text-sm uppercase tracking-wider">Top Entities in the News</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {actors.map((actor) => (
          <div
            key={actor.name}
            className="bg-card p-3 rounded-lg border border-border flex flex-col items-center justify-center text-center shadow-sm"
          >
            <span className="text-xs font-medium text-muted-foreground uppercase mb-1">Entity</span>
            <span className="text-sm font-bold text-primary truncate w-full" title={actor.name}>
              {actor.name}
            </span>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-semibold">{actor.count} Mentions</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {actor.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-primary" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className="text-muted-foreground">{actor.avgTone.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground/60 italic">
        Note: This summary represents the most active organizations or individuals based on today's snapshot.
      </p>
    </div>
  );
};

export default TopEntities;
