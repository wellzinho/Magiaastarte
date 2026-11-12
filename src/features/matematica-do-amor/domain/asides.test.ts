import { describe, expect, it } from "vitest";
import { quizAsides } from "./asides";
import { prepDuration } from "./prep";

describe("devoluções e preparação", () => {
  it("escolhe no máximo duas devoluções e só com as respostas da sessão", () => {
    const space = quizAsides({ "r.distancia": "procura", "r.pedido": "sim", "r.fala": "sem_mudanca", "r.tentou": "conversar" });
    expect(space).toHaveLength(2);
    expect(space.map((item) => item.id)).toEqual(["aside-espaco", "aside-conversa"]);
    expect(quizAsides({ "r.pedido": "nao_sei" })).toHaveLength(0);
    expect(quizAsides({ "t.pararam": "pediu" })[0]?.text).toContain("sem sugerir uma forma de contornar");
    expect(quizAsides({ "n.viu": "disse" })[0]?.text).toContain("resposta clara");
    expect(quizAsides({ "i.quem": "eu" })[0]?.text).toContain("oportunidades de conversa");
    expect(quizAsides({ "t.tentou": "voltar" })[0]?.text).toContain("não vai te mandar repetir");
  });

  it("deixa a preparação entre 8 e 12 segundos e mais curta com movimento reduzido", () => {
    expect(prepDuration(false)).toBeGreaterThanOrEqual(8000);
    expect(prepDuration(false)).toBeLessThanOrEqual(12000);
    expect(prepDuration(true)).toBeLessThan(prepDuration(false));
  });
});
