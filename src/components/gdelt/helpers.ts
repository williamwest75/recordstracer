import { GDELT_MAPPINGS, type QueryMode } from "./types";

export const getTone = (row: any): number => {
  if (row.AvgTone) return Number(row.AvgTone);
  if (row.V2Tone) return Number(row.V2Tone.split(",")[0]);
  if (row.MentionDocTone) return Number(row.MentionDocTone);
  return 0;
};

export const getSentimentBadge = (avgTone: number) => {
  if (avgTone > 2) return { label: "Positive Coverage", variant: "default" as const };
  if (avgTone < -2) return { label: "Critical / Negative", variant: "destructive" as const };
  return { label: "Neutral / Factual", variant: "secondary" as const };
};

export const getDetails = (row: any, mode: QueryMode): { primary: string; secondary: string } => {
  if (mode === "events") {
    const rootCode = row.EventCode?.toString().slice(0, 2);
    const eventLabel = GDELT_MAPPINGS.eventCodes[rootCode] || `Event ${row.EventCode}`;
    return {
      primary: `${row.Actor1Name || "Unknown"} → ${row.Actor2Name || "Unknown"}`,
      secondary: `${row.SQLDATE ?? ""} · ${eventLabel}`,
    };
  }
  if (mode === "gkg") {
    return {
      primary: row.V2Organizations?.split(";")[0] || row.V2Persons?.split(";")[0] || "Global Event",
      secondary: row.DATE ?? "",
    };
  }
  return {
    primary: row.MentionSourceName || "Unknown",
    secondary: row.MentionDateTime ?? "",
  };
};

export const getLink = (row: any): string | null => row.SOURCEURL || row.url || null;

export const copyToClipboard = (rows: any[]) => {
  const text = rows
    .map(
      (row) =>
        `${row.SQLDATE || row.DATE || row.MentionDateTime}: ${row.Actor1Name || "Event"} - ${row.SOURCEURL || row.url}`
    )
    .join("\n");
  navigator.clipboard.writeText(text);
  alert("Intelligence summary copied to clipboard!");
};

export const exportToCSV = (rows: any[]) => {
  if (rows.length === 0) return;
  const readableData = rows.map((row) => ({
    Date: row.SQLDATE || row.DATE || row.MentionDateTime || "",
    Source: row.Actor1Name || row.MentionSourceName || "N/A",
    Target: row.Actor2Name || "N/A",
    Category: GDELT_MAPPINGS.quadClass[row.QuadClass] || "Unknown",
    Action:
      GDELT_MAPPINGS.eventCodes[row.EventCode?.toString().slice(0, 2)] || "Other Action",
    Sentiment: parseFloat(row.AvgTone || row.MentionDocTone || "0") > 0 ? "Positive" : "Negative",
    URL: row.SOURCEURL || row.url || "",
  }));
  const headers = Object.keys(readableData[0]).join(",");
  const csvRows = readableData.map((row) =>
    Object.values(row)
      .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const blob = new Blob([[headers, ...csvRows].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Intelligence_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
