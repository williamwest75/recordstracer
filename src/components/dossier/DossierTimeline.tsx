import { useState } from "react";
import { Calendar, DollarSign, Scale, Newspaper, ExternalLink, ChevronDown } from "lucide-react";
import type { TimelineEvent } from "@/lib/dossier-types";

interface Props {
  events: TimelineEvent[];
}

const MAX_DEFAULT = 20;

const typeConfig = {
  donation: { icon: DollarSign, color: "text-success", dot: "bg-success" },
  court: { icon: Scale, color: "text-info", dot: "bg-info" },
  news: { icon: Newspaper, color: "text-warning", dot: "bg-warning" },
};

const DossierTimeline = ({ events }: Props) => {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 0) return null;

  const visible = expanded ? events : events.slice(0, MAX_DEFAULT);
  let lastYear = "";

  return (
    <div className="border border-border rounded-lg p-5 bg-card space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-accent" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Timeline</h2>
        <span className="text-xs text-muted-foreground">({events.length} events)</span>
      </div>

      <div className="relative ml-3 border-l-2 border-border pl-5 space-y-3">
        {visible.map((event, i) => {
          const year = event.date.slice(0, 4);
          const showYear = year !== lastYear;
          lastYear = year;
          const config = typeConfig[event.type];
          const Icon = config.icon;

          return (
            <div key={i}>
              {showYear && (
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider -ml-8 mb-2 mt-1">{year}</div>
              )}
              <div className="relative flex items-start gap-3">
                <div className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full ${config.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Icon className={`h-3.5 w-3.5 ${config.color} shrink-0`} />
                    <span className="text-sm font-medium text-foreground">{event.title}</span>
                    {event.url && (
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    {event.detail && ` · ${event.detail}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length > MAX_DEFAULT && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
        >
          <ChevronDown className="h-3.5 w-3.5" /> Show all {events.length} events
        </button>
      )}
    </div>
  );
};

export default DossierTimeline;
