import type { Answers } from "./types";

export type QuizAside = { afterStepId: string; id: string; text: string };

const CANDIDATES: Array<QuizAside & { when: (answers: Answers) => boolean }> = [
  {
    afterStepId: "r.pedido",
    id: "aside-espaco",
    text: "Você busca mais contato quando sente distância, e a outra pessoa já falou em espaço. Vou considerar as duas necessidades sem tratar nenhuma delas como errada.",
    when: (answers) => answers["r.distancia"] === "procura" && (answers["r.pedido"] === "sim" || answers["r.pedido"] === "parecido"),
  },
  {
    afterStepId: "r.efeito",
    id: "aside-retomada",
    text: "Você já tentou recuar e dar espaço. Como quase sempre precisa retomar o contato, a leitura também precisa olhar para a participação da outra pessoa.",
    when: (answers) => answers["r.distancia"] === "espera" && answers["r.efeito"] === "preciso_retomar",
  },
  {
    afterStepId: "r.tentou",
    id: "aside-conversa",
    text: "Entendi. Vocês conseguem chegar ao assunto, mas a mudança não se mantém. Então a orientação não vai se limitar a mandar vocês conversarem outra vez.",
    when: (answers) => answers["r.fala"] === "sem_mudanca" && answers["r.tentou"] === "conversar",
  },
  {
    afterStepId: "t.tentou",
    id: "aside-ja-perguntou",
    text: "Você já perguntou sobre voltar. A leitura não vai te mandar repetir a mesma pergunta.",
    when: (answers) => answers["t.tentou"] === "voltar",
  },
  {
    afterStepId: "t.pararam",
    id: "aside-distancia",
    text: "A pessoa pediu distância. Por isso, sua leitura vai se concentrar no que você pode fazer por você, sem sugerir uma forma de contornar esse limite.",
    when: (answers) => answers["t.pararam"] === "pediu",
  },
  {
    afterStepId: "i.quem",
    id: "aside-iniciativa",
    text: "Você tem criado as oportunidades de conversa. O que ainda falta perceber é como a outra pessoa participa quando existe espaço para isso.",
    when: (answers) => answers["i.quem"] === "eu",
  },
  {
    afterStepId: "n.viu",
    id: "aside-recusa",
    text: "Você já recebeu uma resposta clara. A questão agora não é encontrar uma técnica para mudar essa resposta, mas entender como lidar com o que continua em você.",
    when: (answers) => answers["n.viu"] === "disse",
  },
  {
    afterStepId: "n.desejo",
    id: "aside-ainda-quer",
    text: "Entendi que você ainda quer tentar. Como já houve uma resposta clara, a leitura vai considerar o que você sente sem transformar isso numa estratégia para mudar essa resposta.",
    when: (answers) => answers["n.desejo"] === "tentar",
  },
];

export function quizAsides(answers: Answers): QuizAside[] {
  return CANDIDATES.filter((item) => item.when(answers))
    .slice(0, 2)
    .map(({ afterStepId, id, text }) => ({ afterStepId, id, text }));
}
