import type { TimelineEvent, DossierFecData, DossierCourtData } from "./dossier-types";

export function buildTimeline(
  fecData: DossierFecData | null | undefined,
  courtData: DossierCourtData | null | undefined,
  newsData: any[] | null | undefined
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // FEC contributions
  if (fecData?.contributions) {
    for (const c of fecData.contributions) {
      if (c.date) {
        events.push({
          date: c.date,
          type: "donation",
          title: `$${c.amount.toLocaleString()} → ${c.committee_name}`,
          detail: c.contributor_employer
            ? `${c.contributor_city}, ${c.contributor_state} · ${c.contributor_employer}`
            : `${c.contributor_city}, ${c.contributor_state}`,
          url: c.fec_url,
          amount: c.amount,
        });
      }
    }
  }

  // CourtListener dockets
  if (courtData?.dockets?.results) {
    for (const d of courtData.dockets.results) {
      if (d.date_filed) {
        events.push({
          date: d.date_filed,
          type: "court",
          title: d.case_name,
          detail: `${d.court} · ${d.docket_number}${d.date_terminated ? " · Terminated " + d.date_terminated : " · Active"}`,
          url: d.url,
        });
      }
    }
  }

  // GDELT news
  if (newsData) {
    for (const n of newsData.slice(0, 15)) {
      const rawDate = n.SQLDATE || n.DATE || n.MentionDateTime || "";
      const isoDate = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate;
      if (isoDate) {
        events.push({
          date: isoDate,
          type: "news",
          title: n.Actor1Name || n.MentionSourceName || "News mention",
          detail: n.SOURCEURL || n.url || "",
          url: n.SOURCEURL || n.url || null,
        });
      }
    }
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}
