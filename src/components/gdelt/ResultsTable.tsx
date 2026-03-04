import { ExternalLink, Copy, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { QueryMode } from "./types";
import { getTone, getSentimentBadge, getDetails, getLink, copyToClipboard, exportToCSV } from "./helpers";

interface ResultsTableProps {
  results: any[];
  mode: QueryMode;
  dataSource?: string;
}

const ResultsTable = ({ results, mode, dataSource }: ResultsTableProps) => (
  <div className="mt-2">
    <div className="mb-4 flex items-center gap-2">
      <Badge variant="outline" className="text-[11px] font-medium gap-1">
        ⚡ Powered by {dataSource === "gdelt-doc-api" ? "GDELT Doc API" : "BigQuery"}
      </Badge>
      {dataSource === "gdelt-doc-api" && (
        <span className="text-[11px] text-muted-foreground">
          (tone/sentiment data unavailable in this mode)
        </span>
      )}
    </div>

    <div className="flex justify-end gap-2 mb-2">
      <Button variant="outline" size="sm" onClick={() => copyToClipboard(results)}>
        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportToCSV(results)}>
        <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
      </Button>
    </div>

    <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
      <ScrollArea className="h-[600px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-medium uppercase tracking-wider">Details</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider">Sentiment / Tone</TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row: any, idx: number) => {
                const tone = getTone(row);
                const details = getDetails(row, mode);
                const link = getLink(row);
                const sentiment = getSentimentBadge(tone);
                const explanation =
                  tone > 2
                    ? "The language in these reports is predominantly positive, optimistic, or supportive."
                    : tone < -2
                    ? "The language is predominantly critical, focusing on conflict, tragedy, or negative sentiment."
                    : "The reporting is mostly factual, neutral, or balanced in its delivery.";

                return (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell className="py-4">
                      <div className="text-sm font-medium text-foreground">{details.primary}</div>
                      <div className="text-xs text-muted-foreground">{details.secondary}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 cursor-help">
                              <Badge variant={sentiment.variant} className="text-xs">
                                {sentiment.label} ({tone.toFixed(1)})
                              </Badge>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            {explanation}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View Source <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  </div>
);

export default ResultsTable;
