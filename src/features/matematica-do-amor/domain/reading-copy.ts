import type { PersonFigures, PlanRow, TextBlock } from "./types";

export const INSTAGRAM_URL = "https://www.instagram.com/magia.astarte/";
export const INSTAGRAM_HANDLE = "@magia.astarte";

export type ReadingSource = {
  youName: string;
  theirName: string;
  readAt: Date;
  blocks: TextBlock[];
  plan: PlanRow[];
  figures: { you: PersonFigures; them: PersonFigures } | null;
};

export type ReadingSection = {
  title: string;
  paragraphs: string[];
};

export function readingFileName(firstName: string, readAt: Date): string {
  const name =
    firstName
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "leitura";
  const year = readAt.getFullYear();
  const month = String(readAt.getMonth() + 1).padStart(2, "0");
  const day = String(readAt.getDate()).padStart(2, "0");
  return `matematica-do-amor-${name}-${year}-${month}-${day}.pdf`;
}

export function readingDateLabel(readAt: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(readAt);
}

export function readingSections(source: ReadingSource): ReadingSection[] {
  const used = new Set<string>();
  const sections: ReadingSection[] = [];
  const take = (title: string, accept: (block: TextBlock) => boolean) => {
    const paragraphs: string[] = [];
    for (const block of source.blocks) {
      const text = block.text.trim();
      if (!text || used.has(block.id) || !accept(block)) continue;
      used.add(block.id);
      paragraphs.push(text);
    }
    if (paragraphs.length) sections.push({ title, paragraphs });
  };
  const idOf = (name: string) => (block: TextBlock) => block.id === name || block.id.startsWith(`${name}-`);

  take("O que você contou", idOf("motivo"));
  if (source.figures) {
    sections.push({
      title: "Números calculados",
      paragraphs: [numberLine(source.youName, source.figures.you), numberLine(source.theirName, source.figures.them)],
    });
  }
  take("Resposta direta", idOf("direta"));
  take("A dinâmica entre vocês", (block) => block.chapter === 2);
  take("Como agir", (block) => block.chapter === 3);
  take("O que esperar", idOf("consequencia"));
  take("Como interpretar a reação", idOf("ambiguo"));
  take("Sinais de que vale a pena continuar", idOf("abertura"));
  take("Sinais de que é melhor não insistir", (block) => idOf("fechamento")(block) || idOf("limite")(block));
  const rest = source.blocks.map((block) => (used.has(block.id) ? "" : block.text.trim())).filter(Boolean);
  if (rest.length) {
    const dynamic = sections.find((section) => section.title === "A dinâmica entre vocês");
    if (dynamic) dynamic.paragraphs.push(...rest);
    else sections.push({ title: "A dinâmica entre vocês", paragraphs: rest });
  }
  const closing = source.plan.map((row) => `${row.label}: ${row.text}`.trim()).filter((line) => line !== ":");
  if (closing.length) sections.push({ title: "Encerramento", paragraphs: closing });
  return sections;
}

function numberLine(name: string, figures: PersonFigures): string {
  const piece = (label: string, value: number | null) => `${label} ${value ?? "não calculada"}`;
  return `${name}: ${piece("motivação", figures.motivation)}, ${piece("impressão", figures.impression)}, ${piece("expressão", figures.expression)}, ${piece("caminho de vida", figures.path)}.`;
}
