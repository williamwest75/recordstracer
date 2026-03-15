import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, ExternalLink, FileText, Search, Trash2, Download, Lock } from "lucide-react";
import ShareInvestigationDialog from "@/components/dashboard/ShareInvestigationDialog";
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
import { generateInvestigationReport } from "@/lib/generateInvestigationReport";

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
  canExport?: boolean;
  canShare?: boolean;
}

const MAX_VISIBLE = 5;

const InvestigationCard = ({ investigation, savedResults, onDelete, onDeleteResult, canExport = true, canShare = true }: InvestigationCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const resultCount = savedResults.length;
  const visibleResults = showAll ? savedResults : savedResults.slice(0, MAX_VISIBLE);

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canExport) return;
    generateInvestigationReport({
      title: investigation.title,
      description: investigation.description,
      createdAt: investigation.created_at,
      savedResults: savedResults.map(sr => ({
        result_data: sr.result_data,
        notes: sr.notes,
        created_at: sr.created_at,
      })),
    });
  };

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
          {resultCount > 0 && (
            canExport ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-accent"
                title="Export investigation as PDF"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground cursor-not-allowed opacity-50"
                title="Export requires Investigator plan"
                onClick={(e) => e.stopPropagation()}
              >
                <Lock className="h-4 w-4" />
              </Button>
            )
          )}
          {canShare ? (
            <ShareInvestigationDialog investigationId={investigation.id} investigationTitle={investigation.title} />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground cursor-not-allowed opacity-50"
              title="Sharing requires Newsroom plan"
              onClick={(e) => e.stopPropagation()}
            >
              <Lock className="h-4 w-4" />
            </Button>
          )}
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

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border bg-muted/10">
          {resultCount === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">No records saved yet.</p>
              <Link to="/">
                <Button variant="accent" size="sm" className="gap-1">
                  <Search className="h-3.5 w-3.5" /> Run a Search
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleResults.map((sr) => {
                const rd = sr.result_data as any;
                const source = rd?.source || "Unknown Source";
                const desc = rd?.description || "";
                const url = rd?.sourceUrl || rd?.url || null;
                const category = rd?.category || "";
                const searchName = rd?.searchName;
                const searchState = rd?.searchState;

                return (
                  <div key={sr.id} className="flex items-center gap-3 px-4 py-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{source}</p>
                      {desc && <p className="text-xs text-muted-foreground truncate">{desc}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {category === "search" && searchName ? (
                        <Link
                          to={`/search-results?name=${encodeURIComponent(searchName)}&state=${encodeURIComponent(searchState || "")}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          View Results <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          View Source <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove this saved record?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove "{source}" from this investigation.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteResult(sr.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
              {resultCount > MAX_VISIBLE && (
                <div className="px-4 py-2 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    {showAll ? "Show fewer" : `Show all ${resultCount} records`}
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
