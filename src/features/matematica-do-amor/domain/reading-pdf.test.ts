import { describe, expect, it } from "vitest";
import { drawReadingPdf, pdfSafe } from "./reading-pdf";
import { readingFileName, readingSections, type ReadingSource } from "./reading-copy";
import type { TextBlock } from "./types";

const figures = {
  you: { motivation: 2, impression: 5, expression: 7, path: 6 },
  them: { motivation: 5, impression: 3, expression: 8, path: 2 },
};

function source(blocks: TextBlock[], plan = [{ label: "Faça agora", text: "Uma mensagem, uma vez." }]): ReadingSource {
  return {
    youName: "João",
    theirName: "Inês",
    readAt: new Date(2026, 10, 12),
    blocks,
    plan,
    figures,
  };
}

describe("pdf da orientação", () => {
  it("normaliza o nome do arquivo e não repete a leitura", () => {
    expect(readingFileName("João", new Date(2026, 10, 12))).toBe("matematica-do-amor-joao-2026-11-12.pdf");
    expect(readingFileName("Maria da Silva!", new Date(2026, 0, 2))).toBe("matematica-do-amor-maria-da-silva-2026-01-02.pdf");
    const blocks: TextBlock[] = [
      { id: "direta", chapter: 1, text: "Minha resposta mais direta: não insista nessa volta neste momento." },
      { id: "motivo", chapter: 1, text: "João e Inês: ela pediu para você não procurar." },
      { id: "consequencia", chapter: 1, text: "A consequência prática é esta: decidir em igualdade." },
      { id: "casal", chapter: 2, text: "Na conta do casal, a necessidade que aparece é privacidade." },
      { id: "acao", chapter: 3, text: "Não procurar Inês de novo." },
      { id: "abertura", chapter: 4, text: "Abertura, aqui, é iniciativa de Inês." },
      { id: "ambiguo", chapter: 4, text: "Ambiguidade é carinho sem decisão." },
      { id: "fechamento", chapter: 4, text: "Fechamento é recusa." },
      { id: "limite", chapter: 4, text: "Se Inês já limitou o contato, não envie outra mensagem." },
    ];
    const paragraphs = readingSections(source(blocks)).flatMap((section) => section.paragraphs);
    expect(paragraphs.filter((line) => line === blocks[0]?.text)).toHaveLength(1);
    expect(paragraphs.join("\n")).toContain("motivação 2");
    expect(paragraphs.join("\n")).toContain("Inês: motivação 5");
    expect(paragraphs.join("\n")).not.toContain("leitura grátis");
  });

  it("gera um pdf curto e um pdf longo com acentos e o link do Instagram", async () => {
    const short = await drawReadingPdf(source([{ id: "direta", chapter: 1, text: "A ação de João não muda a resposta." }]));
    expect(short.getNumberOfPages()).toBe(1);
    const longBlocks: TextBlock[] = Array.from({ length: 24 }, (_, index) => ({
      id: `acao-${index}`,
      chapter: 3 as const,
      text: `Parágrafo ${index + 1}. A orientação de João para Inês continua específica, com ação, limite e consequência, sem repetir a leitura gratuita nem inventar um conselho novo para este caso.`,
    }));
    const long = await drawReadingPdf(source(longBlocks));
    expect(long.getNumberOfPages()).toBeGreaterThan(1);
    const output = long.output();
    expect(output).toContain("https://www.instagram.com/magia.astarte/");
    expect(output).toMatch(/Jo[aã\xE3]/);
    expect(pdfSafe("ação “não”")).toBe('ação "não"');
  });
});
