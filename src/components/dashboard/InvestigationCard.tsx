import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, ExternalLink, FileText, Search, Trash2 } from "lucide-react";
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

const MAX_VISIBLE = 5;

const InvestigationCard = ({ investigation, savedResults, onDelete, onDeleteResult }: InvestigationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const resultCount = savedResults.length;
  const visibleResults = showAll ? savedResults : savedResults.slice(0, MAX_VISIBLE);

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
              <Link to="/">
                <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                  <Search className="h-3.5 w-3.5" /> Run a Search
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleResults.map((result) => {
                const data = result.result_data as Record<string, any> | null;
                const source = data?.source || "Unknown source";
                const description = data?.description || "";
                const sourceUrl = data?.sourceUrl || "";

                return (
                  <div key={result.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{source}</p>
                        {description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {sourceUrl && (
                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                              View Source ↗
                            </span>
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
              {resultCount > MAX_VISIBLE && !showAll && (
                <div className="px-4 py-3 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs text-accent hover:underline font-medium"
                  >
                    View all {resultCount} records
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestigationCard;
