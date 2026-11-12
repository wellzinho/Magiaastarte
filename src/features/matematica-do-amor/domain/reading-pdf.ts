import type { jsPDF } from "jspdf";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, readingDateLabel, readingFileName, readingSections, type ReadingSource } from "./reading-copy";

const GREEN: [number, number, number] = [7, 94, 84];
const INK: [number, number, number] = [17, 27, 33];
const MUTED: [number, number, number] = [90, 104, 112];
const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_BOTTOM = 278;
const CONTENT_TOP = 24;
const WIDTH = PAGE_WIDTH - MARGIN * 2;

export async function downloadReadingPdf(source: ReadingSource): Promise<void> {
  const doc = await drawReadingPdf(source);
  doc.save(readingFileName(source.youName, source.readAt));
}

export async function drawReadingPdf(source: ReadingSource): Promise<jsPDF> {
  const { jsPDF: Pdf } = await import("jspdf");
  const doc = new Pdf({ unit: "mm", format: "a4" });
  doc.setProperties({ title: "Matemática do Amor", creator: "Magia Astarte", author: "Magia Astarte" });
  paintHeader(doc);
  let y = CONTENT_TOP;
  y = writeLine(doc, "Matemática do Amor", y, { size: 18, style: "bold", color: GREEN, gap: 8 });
  y = writeLine(doc, source.youName, y, { size: 12, style: "bold", color: INK, gap: 5.4 });
  y = writeLine(doc, `Leitura com ${source.theirName}`, y, { size: 12, style: "normal", color: INK, gap: 5.4 });
  y = writeLine(doc, readingDateLabel(source.readAt), y, { size: 11, style: "normal", color: MUTED, gap: 8 });

  for (const section of readingSections(source)) {
    y = writeLine(doc, section.title, y, { size: 13, style: "bold", color: GREEN, gap: 6.2, before: 3 });
    for (const paragraph of section.paragraphs) {
      y = writeParagraph(doc, paragraph, y);
    }
  }

  y = writeLine(doc, "Continue acompanhando a Magia Astarte", y, { size: 12, style: "bold", color: GREEN, gap: 6, before: 4 });
  y = writeInstagram(doc, y);
  paintFooters(doc);
  return doc;
}

function paintHeader(doc: jsPDF) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...GREEN);
  doc.text("Magia Astarte", MARGIN, 14);
}

function paintFooters(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Magia Astarte · Matemática do Amor", MARGIN, 288);
    doc.text(String(page), PAGE_WIDTH - MARGIN, 288, { align: "right" });
  }
}

function freshPage(doc: jsPDF): number {
  doc.addPage();
  paintHeader(doc);
  return CONTENT_TOP;
}

function writeLine(
  doc: jsPDF,
  text: string,
  y: number,
  options: { size: number; style: "bold" | "normal"; color: [number, number, number]; gap: number; before?: number },
): number {
  let cursor = y + (options.before ?? 0);
  if (cursor + options.gap > CONTENT_BOTTOM) cursor = freshPage(doc);
  doc.setFont("helvetica", options.style);
  doc.setFontSize(options.size);
  doc.setTextColor(...options.color);
  doc.text(pdfSafe(text), MARGIN, cursor);
  return cursor + options.gap;
}

function writeParagraph(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  const lines = asLines(doc.splitTextToSize(pdfSafe(text), WIDTH));
  let cursor = y;
  for (const line of lines) {
    if (cursor + 5.2 > CONTENT_BOTTOM) cursor = freshPage(doc);
    doc.text(line, MARGIN, cursor);
    cursor += 5.2;
  }
  return cursor + 1.6;
}

function writeInstagram(doc: jsPDF, y: number): number {
  let cursor = y;
  if (cursor + 6 > CONTENT_BOTTOM) cursor = freshPage(doc);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const prefix = "Siga ";
  const suffix = " no Instagram";
  doc.setTextColor(...INK);
  doc.text(prefix, MARGIN, cursor);
  const prefixWidth = doc.getTextWidth(prefix);
  doc.setTextColor(...GREEN);
  doc.textWithLink(INSTAGRAM_HANDLE, MARGIN + prefixWidth, cursor, { url: INSTAGRAM_URL });
  doc.setTextColor(...INK);
  doc.text(suffix, MARGIN + prefixWidth + doc.getTextWidth(INSTAGRAM_HANDLE), cursor);
  return cursor + 6;
}

function asLines(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

export function pdfSafe(text: string): string {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\n\t\u0020-\u00ff]/g, "");
}
