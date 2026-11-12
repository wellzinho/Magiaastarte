import { describe, expect, it } from "vitest";
import { quizPlan } from "../content/steps";
import { PRICE_LABEL } from "../domain/payment";
import type { Answers, DateParts } from "../domain/types";
import { buildDocument, buildPreview, deliveredTexts, type ReadingDocument } from "./assemble";
import { synthesize } from "./synthesis";
import { pronounsOf } from "../domain/pronouns";
import { addressOf } from "../content/steps";

const youDate: DateParts = { day: 14, month: 7, year: 1992 };
const theirDate: DateParts = { day: 15, month: 3, year: 1991 };
const cusp: DateParts = { day: 21, month: 3, year: 1990 };

const FORBIDDEN =
  /lente simbólica|esses pontos organizam|movimento com pertencimento|o tema da constância|não desmente a Motivação|atitude pequena faria diferença|o que fica em aberto pode envolver|o modo como o contato parou|sua orientação considera três pontos|refletir sobre a sua jornada|alma gêmea|evitar o término/i;

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function read(answers: Answers, yourName = "Ana Silva", theirName = "João Pereira", dates: [DateParts, DateParts] = [youDate, theirDate]): ReadingDocument {
  const preview = buildPreview(answers, yourName, theirName, dates[0], dates[1], "simulated");
  const document = buildDocument(answers, yourName, theirName, dates[0], dates[1], "resposta");
  if ("error" in preview || "error" in document) throw new Error("leitura");
  return document;
}

const paths: Array<{ name: string; answers: Answers; names?: [string, string]; check: (text: string, document: ReadingDocument) => void }> = [
  {
    name: "término estranho, já perguntou e quer tentar de novo",
    answers: { scenario: "T", gender: "homem", "t.contato": "estranho", "t.estranho": "evita", "t.quem": "eu", "t.tentou": "voltar", "t.desejo": "de_novo" },
    check: (text) => {
      expect(text).toMatch(/voltar|insistir/i);
      expect(text).not.toContain("Você tem vontade de conversar sobre o que precisaria mudar para os dois?");
    },
  },
  {
    name: "sem contato e com pedido de distância",
    answers: { scenario: "T", gender: "homem", "t.contato": "nenhum", "t.pararam": "pediu", "t.tentou": "afastar", "t.desejo": "voltar" },
    check: (text) => {
      expect(text).toMatch(/não insistir agora|limite claro/i);
      expect(text).not.toContain("Gosto de conversar com você");
      expect(text).not.toContain("possibilidade de a gente voltar");
    },
  },
  {
    name: "contato dos dois e quer saber da abertura",
    answers: { scenario: "T", gender: "homem", "t.contato": "voltamos", "t.falaram": "sim", "t.quem": "dois", "t.tentou": "aconteceu", "t.desejo": "abertura" },
    check: (text) => {
      expect(text).toMatch(/conversar agora|vale conversar|abertura/i);
      expect(text).not.toMatch(/só você procura|sustentada mais por você/i);
    },
  },
  {
    name: "relação 5 e 6, procura e pedido de espaço",
    names: ["Ines", "Bela"],
    answers: { scenario: "R", gender: "homem", "r.status": "casados", "r.falta": "tempo", "r.fala": "sem_mudanca", "r.distancia": "procura", "r.pedido": "sim", "r.tentou": "conversar", "r.desejo": "interesse" },
    check: (text) => {
      expect(text).toMatch(/liberdade|espaço/);
      expect(text).toMatch(/cuidado|compromisso/);
      expect(text).toMatch(/participação|comportamento específico/i);
      expect(text).not.toMatch(/vamos conversar sobre o problema/i);
    },
  },
  {
    name: "já dá espaço e só ela retoma",
    names: ["Ines", "Bela"],
    answers: { scenario: "R", gender: "homem", "r.status": "casados", "r.falta": "tempo", "r.fala": "escuta", "r.distancia": "espera", "r.efeito": "preciso_retomar", "r.tentou": "espaco", "r.desejo": "proximidade" },
    check: (text, document) => {
      expect(document.blocks.find((block) => block.id === "acao")?.text.toLowerCase()).not.toMatch(/^dar mais espaço|dê mais espaço/);
      expect(text).toMatch(/já recuou|já tem esperado|participação/i);
    },
  },
  {
    name: "tarefas com acordo descumprido",
    answers: { scenario: "R", gender: "homem", "r.status": "namoro", "r.falta": "tarefas", "r.fala": "escuta", "r.peso": "maior_parte", "r.acordo_tarefas": "so_eu", "r.tentou": "combinado", "r.desejo": "assumir" },
    check: (text) => {
      expect(text).toMatch(/responsabilidade concreta|parte concreta/i);
    },
  },
  {
    name: "interesse incerto só com a cliente",
    answers: { scenario: "I", gender: "mulher", "i.relacao": "frequente", "i.quem": "eu", "i.duvida": "iniciativa", "i.limite": "nao", "i.desejo": "interesse" },
    check: (text) => {
      expect(text).toMatch(/observar|aproxim/i);
      expect(text).not.toMatch(/já disse que não/i);
    },
  },
  {
    name: "interesse incerto com os dois iniciando",
    answers: { scenario: "I", gender: "mulher", "i.relacao": "frequente", "i.quem": "dois", "i.duvida": "esfria", "i.limite": "nao", "i.desejo": "falar" },
    check: (text) => {
      expect(text).not.toMatch(/só você|sustentada mais por você/i);
    },
  },
  {
    name: "recusa expressa",
    answers: { scenario: "N", gender: "homem", "n.viu": "disse", "n.contato": "as_vezes", "n.pesa": "pensando", "n.tentou": "afastar", "n.desejo": "tentar" },
    check: (text) => {
      expect(text).toMatch(/limite claro|não insistir/i);
      expect(text).not.toContain("Gosto de conversar com você");
    },
  },
  {
    name: "suposição incerta volta ao ramo incerto",
    answers: { scenario: "N", gender: "homem", "n.viu": "incerto", "i.relacao": "frequente", "i.quem": "eu", "i.duvida": "iniciativa", "i.limite": "nao", "i.desejo": "interesse" },
    check: (text) => {
      expect(text).not.toMatch(/já disse que não|me disse claramente/i);
    },
  },
];

describe("resposta direta e coerência", () => {
  it.each(paths)("$name", ({ answers, names, check }) => {
    const document = read(answers, names?.[0], names?.[1]);
    const text = deliveredTexts(document).join("\n");
    expect(document.blocks[0]?.text.startsWith("Minha resposta mais direta")).toBe(true);
    expect(text).toMatch(/Pelos números|compatibilidade|combinação/i);
    expect(new Set(document.blocks.map((block) => block.chapter))).toEqual(new Set([1, 2, 3, 4]));
    for (const block of document.blocks) expect(words(block.text)).toBeLessThanOrEqual(90);
    expect(text).not.toMatch(FORBIDDEN);
    expect(deliveredTexts(document).join("\n")).toContain(document.blocks[0]?.text ?? "");
    const freeWords = words(document.free.join(" "));
    expect(freeWords).toBeGreaterThan(120);
    expect(freeWords).toBeLessThan(420);
    check(text, document);
  });

  it("não usa signo numa data de transição e três respostas mudam a recomendação", () => {
    const pace = { scenario: "R", gender: "homem", "r.status": "namoro", "r.falta": "conversa", "r.fala": "adia", "r.distancia": "combina", "r.acordo_geral": "ambos", "r.tentou": "tempo", "r.desejo": "sem_brigar" };
    const boundary = synthesize(pace, "Ana Silva", "João", cusp, theirDate, pronounsOf(addressOf(pace)));
    if ("error" in boundary) throw new Error(boundary.error);
    expect(boundary.solar).toBeNull();
    const back = read(paths[1]?.answers ?? {});
    const mutual = read(paths[2]?.answers ?? {});
    const fresh = read({ scenario: "T", gender: "homem", "t.contato": "nenhum", "t.pararam": "parou", "t.tentou": "nada", "t.desejo": "abertura" });
    expect(back.blocks[0]?.text).not.toBe(mutual.blocks[0]?.text);
    expect(fresh.blocks[0]?.text).not.toBe(mutual.blocks[0]?.text);
    expect(back.moduleId).toBe("do_not_insist");
    expect(mutual.moduleId).toBe("talk_now");
    expect(fresh.moduleId).toBe("one_clear_attempt");
  });

  it("a prévia não esconde a fala de reconquista porque ela não existe no limite", () => {
    const preview = buildPreview(paths[1]?.answers ?? {}, "Ana Silva", "João", youDate, theirDate, "simulated");
    if ("error" in preview) throw new Error(preview.error);
    expect(preview.bubbles.join(" ")).not.toContain("possibilidade de a gente voltar");
    expect(preview.cta).toContain(PRICE_LABEL);
    const offer = preview.offers.resposta ?? [];
    const priceAt = offer.findIndex((line) => line.includes(PRICE_LABEL));
    expect(priceAt).toBeGreaterThanOrEqual(3);
    expect(offer.slice(0, priceAt).join(" ")).toMatch(/agir|abordar|observar|sinais|hábito|promessa|risco/i);
  });
});

describe("grafo do quiz", () => {
  it("não oferece opção incoerente com o término, a recusa ou o contato", () => {
    const seen = new Set<string>();
    const walk = (answers: Answers, depth: number) => {
      if (depth > 20) throw new Error("quiz profundo demais");
      const plan = quizPlan(answers);
      const pending = plan.find((step) => !answers[step.id]);
      if (!pending) {
        seen.add(plan.map((step) => step.id).join(">"));
        return;
      }
      const ended = answers.scenario === "T";
      for (const option of pending.options) {
        const label = option.label.toLowerCase();
        if (ended) {
          expect(label).not.toContain("evitar o término");
          expect(label).not.toContain("evitar que o término");
        }
        if (answers["t.pararam"] === "pediu" && pending.id === "t.tentou") {
          expect(label).not.toContain("queria voltar");
        }
        if (answers["n.viu"] === "incerto" && answers["i.limite"] !== "sim") {
          expect(pending.id === "n.viu" || !pending.id.startsWith("n.")).toBe(true);
        }
        walk({ ...answers, [pending.id]: option.id }, depth + 1);
      }
    };
    walk({}, 0);
    expect(seen.size).toBeGreaterThan(20);
  });
});
