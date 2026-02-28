import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";

interface SavedResult {
  id: string;
  created_at: string;
  notes: string | null;
  result_data: Json;
}

interface InvestigationCardProps {
  investigation: Tables<"investigations">;
  savedResults: SavedResult[];
  onDelete: (id: string) => void;
  onDeleteResult: (resultId: string) => void;
}

const InvestigationCard = ({ investigation, savedResults, onDelete, onDeleteResult }: InvestigationCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const resultCount = savedResults.length;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{investigation.title}</p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {resultCount} saved record{resultCount !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Created {new Date(investigation.created_at).toLocaleDateString()}
            {investigation.description && ` · ${investigation.description}`}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this investigation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove "{investigation.title}" and all {resultCount} saved record{resultCount !== 1 ? "s" : ""}. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(investigation.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Expanded saved results */}
      {expanded && (
        <div className="border-t border-border">
          {resultCount === 0 ? (
            <div className="p-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No saved records yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Save results from search to this investigation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {savedResults.map((result) => {
                const data = result.result_data as Record<string, any> | null;
                const source = data?.source || "Unknown source";
                const description = data?.description || "";
                const category = data?.category || "";
                const sourceUrl = data?.sourceUrl || "";
                const details = data?.details as Record<string, any> | null;

                return (
                  <div key={result.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{source}</p>
                          {category && (
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                              {category}
                            </span>
                          )}
                        </div>
                        {description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
                        )}
                        {details && Object.keys(details).length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(details).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                                <span className="text-foreground font-medium">{String(value ?? "—")}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {result.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">Note: {result.notes}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Saved {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {sourceUrl && (
                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-accent">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove saved record?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{source}" from this investigation.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteResult(result.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestigationCard;
