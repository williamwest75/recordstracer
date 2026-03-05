// Simplified — GDELT BigQuery removed, DOC API only

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

export const getLink = (row: any): string | null => row.SOURCEURL || row.url || null;
