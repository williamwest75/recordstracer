import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, ExternalHyperlink,
} from "docx";
import { saveAs } from "file-saver";
import type { ReportData } from "./generateReport";

// ─── Design Tokens ────────────────────────────────────────────
const NAVY = "1E324B";
const GOLD = "B4821E";
const DARK = "2D2D2D";
const MUTED = "6E6E6E";
const LIGHT = "F0F0F0";
const WHITE = "FFFFFF";

const PAGE_W = 12240; // US Letter
const PAGE_H = 15840;
const MARGIN = 1440; // 1 inch
const CONTENT_W = PAGE_W - MARGIN * 2; // 9360

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: WHITE },
  bottom: { style: BorderStyle.NONE, size: 0, color: WHITE },
  left: { style: BorderStyle.NONE, size: 0, color: WHITE },
  right: { style: BorderStyle.NONE, size: 0, color: WHITE },
};

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

function heading(text: string, level: typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: "Arial", bold: true, size: level === HeadingLevel.HEADING_1 ? 28 : 24, color: NAVY })],
  });
}

function bodyText(text: string, opts?: { bold?: boolean; italic?: boolean; color?: string }) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({
      text, font: "Arial", size: 20,
      bold: opts?.bold, italics: opts?.italic,
      color: opts?.color ?? DARK,
    })],
  });
}

function bulletItem(text: string) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360, hanging: 180 },
    children: [
      new TextRun({ text: "\u2022 ", font: "Arial", size: 20, color: GOLD }),
      new TextRun({ text, font: "Arial", size: 20, color: DARK }),
    ],
  });
}

function numberedItem(index: number, text: string) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360, hanging: 180 },
    children: [
      new TextRun({ text: `${index}. `, font: "Arial", size: 20, bold: true, color: GOLD }),
      new TextRun({ text, font: "Arial", size: 20, color: DARK }),
    ],
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LIGHT, space: 1 } },
    children: [],
  });
}

// ─── Main Export ──────────────────────────────────────────────
export async function generateReportDocx(data: ReportData): Promise<void> {
  const children: Paragraph[] = [];
  const dateStr = data.timestamp.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // ── Title Block ─────────────────────────────────────────────
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: "INVESTIGATIVE REPORT", font: "Arial", bold: true, size: 40, color: NAVY })],
  }));
  children.push(new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text: `Subject: ${data.name}`, font: "Arial", size: 24, color: DARK })],
  }));
  children.push(new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({
      text: `${data.state !== "All States / National" ? data.state + " \u00B7 " : ""}${dateStr}`,
      font: "Arial", size: 20, color: MUTED,
    })],
  }));

  // Gold accent bar
  children.push(new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } },
    children: [],
  }));

  // Summary stats
  const categories = new Set(data.results.map(r => r.category));
  children.push(bodyText(`${data.results.length} records found across ${categories.size} databases`, { bold: true }));
  children.push(bodyText(
    "Record matches do not confirm identity or imply wrongdoing. All findings require independent verification.",
    { italic: true, color: MUTED }
  ));

  children.push(divider());

  // ── Subject Briefing ────────────────────────────────────────
  if (data.briefingSummary) {
    children.push(heading("Subject Briefing", HeadingLevel.HEADING_1));
    children.push(bodyText(data.briefingSummary));
    children.push(divider());
  }

  // ── Key Findings ────────────────────────────────────────────
  if (data.findings && data.findings.length > 0) {
    children.push(heading("Key Findings", HeadingLevel.HEADING_1));
    for (const finding of data.findings) {
      children.push(new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: finding.title, font: "Arial", size: 20, bold: true, color: DARK }),
          new TextRun({ text: `  [${finding.database}]`, font: "Arial", size: 16, color: MUTED }),
        ],
      }));
      children.push(bodyText(finding.detail));
    }
    children.push(divider());
  }

  // ── Cross-References ────────────────────────────────────────
  if (data.crossReferences && data.crossReferences.length > 0) {
    children.push(heading("Cross-References", HeadingLevel.HEADING_1));
    for (const ref of data.crossReferences) {
      children.push(bulletItem(ref));
    }
    children.push(divider());
  }

  // ── Next Steps ──────────────────────────────────────────────
  if (data.nextSteps && data.nextSteps.length > 0) {
    children.push(heading("Recommended Next Steps", HeadingLevel.HEADING_1));
    data.nextSteps.forEach((step, i) => children.push(numberedItem(i + 1, step)));
    children.push(divider());
  }

  // ── Source Records ──────────────────────────────────────────
  children.push(heading("Source Records", HeadingLevel.HEADING_1));

  const grouped: Record<string, typeof data.results> = {};
  for (const r of data.results) {
    (grouped[r.category] ??= []).push(r);
  }

  for (const [cat, items] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[cat] || cat;
    children.push(heading(`${label} (${items.length})`, HeadingLevel.HEADING_2));

    // Build records table
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Source", font: "Arial", size: 18, bold: true, color: WHITE })] })],
        }),
        new TableCell({
          borders: cellBorders, width: { size: 4360, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Description", font: "Arial", size: 18, bold: true, color: WHITE })] })],
        }),
        new TableCell({
          borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Key Details", font: "Arial", size: 18, bold: true, color: WHITE })] })],
        }),
      ],
    });

    const dataRows = items.map((item, idx) => {
      const detailEntries = Object.entries(item.details).slice(0, 3);
      const detailText = detailEntries.map(([k, v]) => `${k}: ${v}`).join("\n");
      const rowFill = idx % 2 === 0 ? WHITE : LIGHT;

      return new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
            shading: { fill: rowFill, type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: item.source, font: "Arial", size: 17, bold: true, color: DARK })] }),
              ...(item.sourceUrl ? [new Paragraph({
                children: [new ExternalHyperlink({
                  children: [new TextRun({ text: "View source \u2192", font: "Arial", size: 14, color: GOLD, style: "Hyperlink" })],
                  link: item.sourceUrl,
                })],
              })] : []),
            ],
          }),
          new TableCell({
            borders: cellBorders, width: { size: 4360, type: WidthType.DXA },
            shading: { fill: rowFill, type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: item.description.slice(0, 200), font: "Arial", size: 17, color: DARK })] })],
          }),
          new TableCell({
            borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
            shading: { fill: rowFill, type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: detailText.split("\n").map(line =>
              new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: line, font: "Arial", size: 15, color: MUTED })] })
            ),
          }),
        ],
      });
    });

    children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    // Tables can't go in the children array directly with Paragraphs in the same way,
    // so we'll use a workaround with the sections approach below
  }

  // ── Disclaimer ──────────────────────────────────────────────
  children.push(divider());
  children.push(bodyText(
    "This report was generated by Record Tracer. Record matches do not confirm identity or imply wrongdoing. All findings must be independently verified before publication. This document is for informational purposes only.",
    { italic: true, color: MUTED }
  ));

  // ─── Build the document with tables interspersed ───────────
  // Since docx sections accept both Paragraph and Table as children,
  // we rebuild the content array properly
  const sectionChildren: (Paragraph | Table)[] = [];

  // Re-create the full content with tables inline
  // Title block
  sectionChildren.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: "INVESTIGATIVE REPORT", font: "Arial", bold: true, size: 40, color: NAVY })],
  }));
  sectionChildren.push(new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text: `Subject: ${data.name}`, font: "Arial", size: 24, color: DARK })],
  }));
  sectionChildren.push(new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({
      text: `${data.state !== "All States / National" ? data.state + " \u00B7 " : ""}${dateStr}`,
      font: "Arial", size: 20, color: MUTED,
    })],
  }));
  sectionChildren.push(new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 1 } },
    children: [],
  }));
  sectionChildren.push(bodyText(`${data.results.length} records found across ${categories.size} databases`, { bold: true }));
  sectionChildren.push(bodyText(
    "Record matches do not confirm identity or imply wrongdoing. All findings require independent verification.",
    { italic: true, color: MUTED }
  ));
  sectionChildren.push(divider());

  // Briefing
  if (data.briefingSummary) {
    sectionChildren.push(heading("Subject Briefing", HeadingLevel.HEADING_1));
    sectionChildren.push(bodyText(data.briefingSummary));
    sectionChildren.push(divider());
  }

  // Findings
  if (data.findings && data.findings.length > 0) {
    sectionChildren.push(heading("Key Findings", HeadingLevel.HEADING_1));
    for (const finding of data.findings) {
      sectionChildren.push(new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: finding.title, font: "Arial", size: 20, bold: true, color: DARK }),
          new TextRun({ text: `  [${finding.database}]`, font: "Arial", size: 16, color: MUTED }),
        ],
      }));
      sectionChildren.push(bodyText(finding.detail));
    }
    sectionChildren.push(divider());
  }

  // Cross-refs
  if (data.crossReferences && data.crossReferences.length > 0) {
    sectionChildren.push(heading("Cross-References", HeadingLevel.HEADING_1));
    for (const ref of data.crossReferences) sectionChildren.push(bulletItem(ref));
    sectionChildren.push(divider());
  }

  // Next steps
  if (data.nextSteps && data.nextSteps.length > 0) {
    sectionChildren.push(heading("Recommended Next Steps", HeadingLevel.HEADING_1));
    data.nextSteps.forEach((step, i) => sectionChildren.push(numberedItem(i + 1, step)));
    sectionChildren.push(divider());
  }

  // Source records with tables
  sectionChildren.push(heading("Source Records", HeadingLevel.HEADING_1));

  for (const [cat, items] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[cat] || cat;
    sectionChildren.push(heading(`${label} (${items.length})`, HeadingLevel.HEADING_2));

    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Source", font: "Arial", size: 18, bold: true, color: WHITE })] })],
        }),
        new TableCell({
          borders: cellBorders, width: { size: 4360, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Description", font: "Arial", size: 18, bold: true, color: WHITE })] })],
        }),
        new TableCell({
          borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: "Key Details", font: "Arial", size: 18, bold: true, color: WHITE })] })],
        }),
      ],
    });

    const dataRows = items.map((item, idx) => {
      const detailEntries = Object.entries(item.details).slice(0, 3);
      const rowFill = idx % 2 === 0 ? WHITE : LIGHT;

      return new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
            shading: { fill: rowFill, type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: item.source, font: "Arial", size: 17, bold: true, color: DARK })] }),
              ...(item.sourceUrl ? [new Paragraph({
                children: [new ExternalHyperlink({
                  children: [new TextRun({ text: "View source \u2192", font: "Arial", size: 14, color: GOLD, style: "Hyperlink" })],
                  link: item.sourceUrl,
                })],
              })] : []),
            ],
          }),
          new TableCell({
            borders: cellBorders, width: { size: 4360, type: WidthType.DXA },
            shading: { fill: rowFill, type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: item.description.slice(0, 200), font: "Arial", size: 17, color: DARK })] })],
          }),
          new TableCell({
            borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
            shading: { fill: rowFill, type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: detailEntries.length > 0
              ? detailEntries.map(([k, v]) =>
                  new Paragraph({ spacing: { after: 20 }, children: [
                    new TextRun({ text: `${k}: `, font: "Arial", size: 15, bold: true, color: DARK }),
                    new TextRun({ text: String(v ?? "N/A").slice(0, 60), font: "Arial", size: 15, color: MUTED }),
                  ]})
                )
              : [new Paragraph({ children: [new TextRun({ text: "\u2014", font: "Arial", size: 15, color: MUTED })] })],
          }),
        ],
      });
    });

    sectionChildren.push(new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: [3000, 4360, 2000],
      rows: [headerRow, ...dataRows],
    }));

    sectionChildren.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // Disclaimer
  sectionChildren.push(divider());
  sectionChildren.push(bodyText(
    "This report was generated by Record Tracer. Record matches do not confirm identity or imply wrongdoing. All findings must be independently verified before publication. This document is for informational purposes only.",
    { italic: true, color: MUTED }
  ));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: NAVY },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: NAVY },
          paragraph: { spacing: { before: 180, after: 100 } },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Record Tracer \u2014 Confidential", font: "Arial", size: 14, color: MUTED })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 14, color: MUTED }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 14, color: MUTED }),
            ],
          })],
        }),
      },
      children: sectionChildren,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  const safeName = data.name.replace(/[^a-zA-Z0-9]/g, "_");
  saveAs(buffer, `RecordTracer_Report_${safeName}_${data.timestamp.toISOString().slice(0, 10)}.docx`);
}
