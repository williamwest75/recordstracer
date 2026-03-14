import jsPDF from "jspdf";
import type { RecordResult } from "@/lib/recordsApi";

const MARGIN = 20;
const PAGE_W = 210; // A4
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
  red: [200, 60, 60] as [number, number, number],
};

function addPage(doc: jsPDF): number {
  doc.addPage();
  return MARGIN;
}

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    return addPage(doc);
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

export interface ReportData {
  name: string;
  state: string;
  results: RecordResult[];
  briefingSummary?: string;
  findings?: { title: string; detail: string; database: string }[];
  nextSteps?: string[];
  crossReferences?: string[];
  timestamp: Date;
}

export function generateReport(data: ReportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = MARGIN;

  // ─── Cover / Header ───────────────────────────────────────────
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, PAGE_W, 50, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.white);
  doc.text("INVESTIGATIVE REPORT", MARGIN, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(`Subject: ${data.name}`, MARGIN, 32);
  doc.text(
    `${data.state !== "All States / National" ? data.state + " · " : ""}${data.timestamp.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    MARGIN,
    40
  );

  // Gold accent bar
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 50, PAGE_W, 2, "F");

  y = 62;

  // Summary stats
  const categories = new Set(data.results.map(r => r.category));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.dark);
  doc.text(`${data.results.length} records found across ${categories.size} databases`, MARGIN, y);
  y += 4;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("Record matches do not confirm identity or imply wrongdoing. All findings require independent verification.", MARGIN, y);
  y += SECTION_GAP;

  // ─── Subject Briefing ─────────────────────────────────────────
  if (data.briefingSummary) {
    y = drawSectionHeader(doc, y, "Subject Briefing");
    doc.setTextColor(...COLORS.dark);
    y = drawWrappedText(doc, data.briefingSummary, MARGIN, y, CONTENT_W, 10);
    y += SECTION_GAP;
  }

  // ─── Key Findings ─────────────────────────────────────────────
  if (data.findings && data.findings.length > 0) {
    y = drawSectionHeader(doc, y, "Key Findings");

    for (const finding of data.findings) {
      y = checkPage(doc, y, 18);

      // Finding title + database badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.dark);
      doc.text(finding.title, MARGIN, y);

      const titleW = doc.getTextWidth(finding.title);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.text(`[${finding.database}]`, MARGIN + titleW + 3, y);
      y += LINE_H;

      doc.setTextColor(...COLORS.dark);
      y = drawWrappedText(doc, finding.detail, MARGIN + 2, y, CONTENT_W - 4, 9);
      y += 3;
    }
    y += SECTION_GAP - 3;
  }

  // ─── Cross-References ─────────────────────────────────────────
  if (data.crossReferences && data.crossReferences.length > 0) {
    y = drawSectionHeader(doc, y, "Cross-References");
    for (const ref of data.crossReferences) {
      y = checkPage(doc, y, 8);
      doc.setTextColor(...COLORS.dark);
      y = drawWrappedText(doc, `• ${ref}`, MARGIN + 2, y, CONTENT_W - 4, 9);
      y += 1;
    }
    y += SECTION_GAP;
  }

  // ─── Next Steps ────────────────────────────────────────────────
  if (data.nextSteps && data.nextSteps.length > 0) {
    y = drawSectionHeader(doc, y, "Recommended Next Steps");
    for (let i = 0; i < data.nextSteps.length; i++) {
      y = checkPage(doc, y, 8);
      doc.setTextColor(...COLORS.dark);
      y = drawWrappedText(doc, `${i + 1}. ${data.nextSteps[i]}`, MARGIN + 2, y, CONTENT_W - 4, 9);
      y += 1;
    }
    y += SECTION_GAP;
  }

  // ─── Source Records ────────────────────────────────────────────
  y = drawSectionHeader(doc, y, "Source Records");

  // Group by category
  const grouped: Record<string, RecordResult[]> = {};
  for (const r of data.results) {
    (grouped[r.category] ??= []).push(r);
  }

  const CATEGORY_LABELS: Record<string, string> = {
    business: "Business Registrations & Filings",
    donations: "Campaign Donations (FEC)",
    contracts: "Government Contracts & Grants",
    court: "Court Records",
    lobbying: "Lobbying Disclosures",
    sanctions: "Sanctions & Watchlists",
    offshore: "Offshore Leaks (ICIJ)",
    assets: "Asset Records",
    property: "Property Records",
    licenses: "Professional Licenses",
    violations: "Violations & Enforcement (OSHA / EPA / FDA)",
    foia: "FOIA Archive (MuckRock)",
  };

  for (const [cat, items] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[cat] || cat;
    y = checkPage(doc, y, 14);

    // Category sub-header
    doc.setFillColor(...COLORS.light);
    doc.rect(MARGIN, y - 1, CONTENT_W, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.navy);
    doc.text(`${label} (${items.length})`, MARGIN + 3, y + 4);
    y += 10;

    for (const item of items) {
      y = checkPage(doc, y, 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.dark);
      doc.text(item.source, MARGIN + 2, y);
      y += LINE_H;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      const descLines = doc.splitTextToSize(item.description, CONTENT_W - 6);
      for (const line of descLines.slice(0, 3)) {
        y = checkPage(doc, y, LINE_H);
        doc.text(line, MARGIN + 2, y);
        y += LINE_H - 0.5;
      }

      // Key details (top 4)
      const detailEntries = Object.entries(item.details).slice(0, 4);
      if (detailEntries.length > 0) {
        for (const [key, value] of detailEntries) {
          y = checkPage(doc, y, LINE_H);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.dark);
          doc.text(`${key}: `, MARGIN + 4, y);
          const keyW = doc.getTextWidth(`${key}: `);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...COLORS.muted);
          const valStr = typeof value === "object" ? JSON.stringify(value) : String(value ?? "N/A");
          doc.text(valStr.slice(0, 80), MARGIN + 4 + keyW, y);
          y += LINE_H - 0.5;
        }
      }

      // Source URL
      if (item.sourceUrl) {
        y = checkPage(doc, y, LINE_H);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.gold);
        doc.text(`Source: ${item.sourceUrl.slice(0, 90)}`, MARGIN + 4, y);
        y += LINE_H;
      }

      y += 2;
    }
    y += 3;
  }

  // ─── Footer disclaimer on last page ────────────────────────────
  y = checkPage(doc, y, 20);
  doc.setDrawColor(...COLORS.light);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  const disclaimer = "This report was generated by Record Tracer. Record matches do not confirm identity or imply wrongdoing. All findings must be independently verified before publication. This document is for informational purposes only.";
  y = drawWrappedText(doc, disclaimer, MARGIN, y, CONTENT_W, 7, "italic");

  // Page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, 290, { align: "right" });
    doc.text("Record Tracer — Confidential", MARGIN, 290);
  }

  // Save
  const safeName = data.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`RecordTracer_Report_${safeName}_${data.timestamp.toISOString().slice(0, 10)}.pdf`);
}
