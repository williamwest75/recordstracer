import jsPDF from "jspdf";
import type { Json } from "@/integrations/supabase/types";

const MARGIN = 20;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 5.5;
const SECTION_GAP = 10;

const COLORS = {
  navy: [30, 50, 75] as [number, number, number],
  gold: [180, 130, 30] as [number, number, number],
  dark: [45, 45, 45] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
  light: [240, 240, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawSectionHeader(doc: jsPDF, y: number, title: string): number {
  y = checkPage(doc, y, 14);
  doc.setFillColor(...COLORS.navy);
  doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text(title.toUpperCase(), MARGIN + 4, y + 5.5);
  doc.setTextColor(...COLORS.dark);
  return y + 12;
}

function drawWrappedText(doc: jsPDF, text: string, x: number, y: number, maxW: number, fontSize: number, style: "normal" | "bold" | "italic" = "normal"): number {
  doc.setFont("helvetica", style);
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    y = checkPage(doc, y, LINE_H);
    doc.text(line, x, y);
    y += LINE_H;
  }
  return y;
}

interface SavedResultData {
  source?: string;
  description?: string;
  category?: string;
  details?: Record<string, string>;
  sourceUrl?: string;
  searchName?: string;
  searchState?: string;
}

export interface InvestigationExportData {
  title: string;
  description?: string | null;
  createdAt: string;
  savedResults: {
    result_data: Json;
    notes: string | null;
    created_at: string;
  }[];
}

export function generateInvestigationReport(data: InvestigationExportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = MARGIN;

  // Cover header
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, PAGE_W, 45, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.text("INVESTIGATION REPORT", MARGIN, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(data.title, MARGIN, 30);
  doc.setFontSize(9);
  doc.text(`Created: ${new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, MARGIN, 38);

  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 45, PAGE_W, 2, "F");

  y = 57;

  // Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text(`${data.savedResults.length} saved record${data.savedResults.length !== 1 ? "s" : ""}`, MARGIN, y);
  y += LINE_H;

  if (data.description) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    y = drawWrappedText(doc, data.description, MARGIN, y, CONTENT_W, 9, "italic");
  }
  y += SECTION_GAP;

  // Group by category
  const grouped: Record<string, { data: SavedResultData; notes: string | null; savedAt: string }[]> = {};
  for (const sr of data.savedResults) {
    const rd = (sr.result_data || {}) as SavedResultData;
    const cat = rd.category || "other";
    (grouped[cat] ??= []).push({ data: rd, notes: sr.notes, savedAt: sr.created_at });
  }

  const CATEGORY_LABELS: Record<string, string> = {
    business: "Business Registrations & Filings",
    donations: "Campaign Donations (FEC)",
    contracts: "Government Contracts & Grants",
    court: "Court Records",
    lobbying: "Lobbying Disclosures",
    sanctions: "Sanctions & Watchlists",
    offshore: "Offshore Leaks (ICIJ)",
    search: "Search References",
    other: "Other Records",
  };

  for (const [cat, items] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[cat] || cat;
    y = drawSectionHeader(doc, y, `${label} (${items.length})`);

    for (const item of items) {
      y = checkPage(doc, y, 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.dark);
      doc.text(item.data.source || "Record", MARGIN + 2, y);
      y += LINE_H;

      if (item.data.description) {
        doc.setTextColor(...COLORS.muted);
        y = drawWrappedText(doc, item.data.description, MARGIN + 2, y, CONTENT_W - 4, 8);
      }

      if (item.data.details) {
        for (const [key, value] of Object.entries(item.data.details).slice(0, 5)) {
          y = checkPage(doc, y, LINE_H);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.dark);
          doc.text(`${key}: `, MARGIN + 4, y);
          const keyW = doc.getTextWidth(`${key}: `);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...COLORS.muted);
          doc.text(String(value ?? "N/A").slice(0, 80), MARGIN + 4 + keyW, y);
          y += LINE_H - 0.5;
        }
      }

      if (item.notes) {
        y = checkPage(doc, y, LINE_H);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.gold);
        y = drawWrappedText(doc, `Note: ${item.notes}`, MARGIN + 4, y, CONTENT_W - 8, 8, "italic");
      }

      if (item.data.sourceUrl) {
        y = checkPage(doc, y, LINE_H);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.gold);
        doc.text(`Source: ${item.data.sourceUrl.slice(0, 90)}`, MARGIN + 4, y);
        y += LINE_H;
      }

      y += 3;
    }
    y += 3;
  }

  // Footer disclaimer
  y = checkPage(doc, y, 20);
  doc.setDrawColor(...COLORS.light);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  y = drawWrappedText(doc, "This report was generated by Record Tracer. Record matches do not confirm identity or imply wrongdoing. All findings must be independently verified before publication.", MARGIN, y, CONTENT_W, 7, "italic");

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, 290, { align: "right" });
    doc.text("Record Tracer — Confidential", MARGIN, 290);
  }

  const safeName = data.title.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`RecordTracer_Investigation_${safeName}.pdf`);
}
