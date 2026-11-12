import { pronounsOf, type Pronouns } from "../domain/pronouns";
import type { Answers, Option } from "../domain/types";

export const WELCOME = [
  "Oi! Boas-vindas à Matemática do Amor, da Magia Astarte ✨",
  "Vou cruzar os números dos nomes e das datas com o que você me contar. A primeira leitura é grátis e já traz uma resposta.",
  "Como tá a história entre vocês hoje?",
] as const;

export const DATA_BRIDGE = "Agora vou calcular os números dos nomes e das datas para cruzar com o que você me contou.";

export const HOW_IT_WORKS =
  "A leitura combina numerologia pitagórica dos nomes e das datas com o contexto que você informou. Quando a data permite, usa também o signo solar como complemento de ritmo e temperamento. É uma interpretação simbólica, não uma previsão do que outra pessoa fará.";

export const SYMBOLIC_NOTE = HOW_IT_WORKS;

export type ResolvedStep = {
  id: string;
  intros: string[];
  question: string;
  options: Option[];
};

type StepDef = {
  id: string;
  applies: (answers: Answers) => boolean;
  intros: (answers: Answers, pronouns: Pronouns) => string[];
  question: (answers: Answers, pronouns: Pronouns) => string;
  options: (answers: Answers, pronouns: Pronouns) => Option[];
};

export function addressOf(answers: Answers): "ele" | "ela" | "pessoa" | undefined {
  if (answers.gender === "homem") return "ele";
  if (answers.gender === "mulher") return "ela";
  if (answers.gender === "skip") return "pessoa";
  return undefined;
}

const contact = (answers: Answers) => answers["t.contato"] === "voltamos" || answers["t.contato"] === "estranho";
const interestPath = (answers: Answers) => answers.scenario === "I" || (answers.scenario === "N" && answers["n.viu"] === "incerto");

const STEPS: StepDef[] = [
  {
    id: "scenario",
    applies: () => true,
    intros: () => [],
    question: () => WELCOME[2],
    options: () => [
      { id: "T", label: "Terminamos" },
      { id: "I", label: "Gosto de alguém e ainda não sei se é recíproco" },
      { id: "N", label: "Gosto de alguém, mas sei que não é correspondido" },
      { id: "R", label: "Estamos juntos, mas a relação anda difícil" },
    ],
  },
  {
    id: "gender",
    applies: (answers) => Boolean(answers.scenario),
    intros: () => [],
    question: () => "A pessoa em quem você tá pensando é homem ou mulher?",
    options: () => [
      { id: "homem", label: "Homem" },
      { id: "mulher", label: "Mulher" },
      { id: "skip", label: "Prefiro não informar" },
    ],
  },
  {
    id: "r.status",
    applies: (answers) => answers.scenario === "R",
    intros: () => [],
    question: () => "Vocês namoram ou são casados?",
    options: () => [
      { id: "namoro", label: "Namoramos" },
      { id: "casados", label: "Somos casados ou vivemos juntos" },
    ],
  },
  {
    id: "r.falta",
    applies: (answers) => Boolean(answers["r.status"]),
    intros: () => [],
    question: () => "O que mais está fazendo falta entre vocês?",
    options: () => [
      { id: "tempo", label: "Tempo de qualidade juntos" },
      { id: "carinho", label: "Carinho e proximidade" },
      { id: "conversa", label: "Conseguir conversar de verdade" },
      { id: "tarefas", label: "Dividir melhor as responsabilidades" },
      { id: "confianca", label: "Confiança e tranquilidade" },
    ],
  },
  {
    id: "r.fala",
    applies: (answers) => Boolean(answers["r.falta"]),
    intros: () => [],
    question: () => "Quando você tenta falar disso, o que costuma acontecer?",
    options: () => [
      { id: "escuta", label: "A pessoa escuta e tenta conversar" },
      { id: "briga", label: "Vira discussão ou defesa" },
      { id: "adia", label: "A pessoa evita ou adia o assunto" },
      { id: "sem_mudanca", label: "A gente conversa, mas depois fica tudo igual" },
      { id: "nao_tentei", label: "Ainda não tentei falar disso" },
    ],
  },
  {
    id: "r.distancia",
    applies: (answers) => ["tempo", "carinho", "conversa"].includes(answers["r.falta"] ?? ""),
    intros: () => [],
    question: () => "Quando você sente essa distância, o que costuma fazer?",
    options: () => [
      { id: "procura", label: "Procuro mais e mando outras mensagens" },
      { id: "espera", label: "Espero e dou espaço" },
      { id: "afasto", label: "Também me afasto" },
      { id: "combina", label: "Tento combinar um momento pra conversar" },
    ],
  },
  {
    id: "r.peso",
    applies: (answers) => answers["r.falta"] === "tarefas",
    intros: () => [],
    question: () => "O que mais pesa nessa divisão?",
    options: () => [
      { id: "maior_parte", label: "Acabo fazendo a maior parte" },
      { id: "lembrar", label: "Preciso lembrar a pessoa toda hora" },
      { id: "nunca_claro", label: "Nunca ficou claro quem cuida de quê" },
      { id: "discorda", label: "A gente discorda sobre o que seria justo" },
    ],
  },
  {
    id: "r.atras",
    applies: (answers) => answers["r.falta"] === "confianca",
    intros: () => [],
    question: () => "O que está por trás dessa preocupação?",
    options: () => [
      { id: "quebrado", label: "Houve um combinado quebrado" },
      { id: "comunicacao", label: "A comunicação ficou diferente" },
      { id: "receio", label: "Tenho receio, mas não aconteceu nada concreto" },
      { id: "nao_detalhar", label: "Prefiro não detalhar" },
    ],
  },
  {
    id: "r.pedido",
    applies: (answers) => answers["r.distancia"] === "procura",
    intros: () => [],
    question: (_answers, pronouns) => `${pronouns.subjectCap} já disse que se sente cobrado ou pediu mais espaço?`,
    options: () => [
      { id: "sim", label: "Sim, claramente" },
      { id: "parecido", label: "Comentou algo parecido" },
      { id: "nunca", label: "Nunca disse isso" },
      { id: "nao_sei", label: "Não sei" },
    ],
  },
  {
    id: "r.efeito",
    applies: (answers) => answers["r.distancia"] === "espera" || answers["r.distancia"] === "afasto",
    intros: () => [],
    question: () => "Quando você dá esse espaço, o que acontece?",
    options: () => [
      { id: "tambem_procura", label: "A pessoa também me procura" },
      { id: "preciso_retomar", label: "Quase sempre preciso retomar" },
      { id: "distancia_aumenta", label: "A distância aumenta" },
      { id: "sem_padrao", label: "Ainda não percebi um padrão" },
    ],
  },
  {
    id: "r.acordo_tarefas",
    applies: (answers) => Boolean(answers["r.peso"]),
    intros: () => [],
    question: () => "Vocês já chegaram a um combinado específico?",
    options: () => [
      { id: "ambos", label: "Sim, os dois cumprem" },
      { id: "so_eu", label: "Sim, mas só eu mantenho" },
      { id: "volta", label: "Melhora por um tempo e volta" },
      { id: "nenhum", label: "Ainda não fizemos um combinado claro" },
    ],
  },
  {
    id: "r.acordo_confianca",
    applies: (answers) => Boolean(answers["r.atras"]),
    intros: () => [],
    question: () => "Vocês já conversaram sobre o que ajudaria a reconstruir essa confiança?",
    options: () => [
      { id: "atitudes", label: "Sim, e houve atitudes" },
      { id: "promessa", label: "Sim, mas ficou na promessa" },
      { id: "ainda_nao", label: "Ainda não conseguimos" },
      { id: "nao_sei", label: "Não sei o que pedir" },
    ],
  },
  {
    id: "r.acordo_geral",
    applies: (answers) => answers["r.distancia"] === "combina",
    intros: () => [],
    question: () => "Quando vocês combinam uma mudança, o que acontece?",
    options: () => [
      { id: "ambos", label: "Os dois participam" },
      { id: "so_eu", label: "Quase sempre só eu tento" },
      { id: "volta", label: "Melhora e depois volta" },
      { id: "nenhum", label: "Ainda não temos um combinado" },
    ],
  },
  {
    id: "r.tentou",
    applies: (answers) => Boolean(answers["r.pedido"] || answers["r.efeito"] || answers["r.acordo_tarefas"] || answers["r.acordo_confianca"] || answers["r.acordo_geral"]),
    intros: () => [],
    question: () => "O que você já tentou e não quer apenas repetir?",
    options: () => [
      { id: "conversar", label: "Conversar sobre o problema" },
      { id: "espaco", label: "Dar mais espaço" },
      { id: "tempo", label: "Propor um tempo juntos" },
      { id: "combinado", label: "Combinar uma mudança concreta" },
      { id: "nao_sei", label: "Ainda não sei como agir" },
    ],
  },
  {
    id: "r.desejo",
    applies: (answers) => Boolean(answers["r.tentou"]),
    intros: () => [],
    question: () => "O que você mais quer que mude entre vocês agora?",
    options: (answers) => {
      if (answers["r.falta"] === "tarefas") {
        return [
          { id: "assumir", label: "Quero que a pessoa assuma a parte dela" },
          { id: "acordo", label: "Quero um acordo que funcione" },
          { id: "sozinho", label: "Quero entender se estou carregando tudo sozinho" },
        ];
      }
      if (answers["r.falta"] === "confianca") {
        return [
          { id: "reconstruir", label: "Quero saber se dá para reconstruir a confiança" },
          { id: "atitudes", label: "Quero atitudes, não só promessas" },
          { id: "afastar", label: "Quero entender se é melhor me afastar" },
        ];
      }
      if (answers["r.falta"] === "conversa") {
        return [
          { id: "sem_brigar", label: "Quero conseguir conversar sem brigar" },
          { id: "mudar", label: "Quero que alguma coisa mude de verdade" },
          { id: "querer", label: "Quero entender se os dois ainda querem essa relação" },
        ];
      }
      return [
        { id: "interesse", label: "Quero que a pessoa volte a demonstrar interesse" },
        { id: "proximidade", label: "Quero mais tempo e proximidade" },
        { id: "continuar", label: "Quero saber se ainda vale continuar" },
      ];
    },
  },
  {
    id: "t.contato",
    applies: (answers) => answers.scenario === "T",
    intros: () => [],
    question: () => "Como está o contato entre vocês desde que terminaram?",
    options: () => [
      { id: "voltamos", label: "Voltamos a conversar." },
      { id: "estranho", label: "A gente se fala, mas tá estranho." },
      { id: "nenhum", label: "A gente não se fala mais." },
    ],
  },
  {
    id: "t.falaram",
    applies: (answers) => answers["t.contato"] === "voltamos",
    intros: () => [],
    question: () => "Vocês já conversaram de verdade sobre o que levou ao término?",
    options: () => [
      { id: "sim", label: "Sim, falamos com clareza." },
      { id: "por_cima", label: "Falamos por cima." },
      { id: "ainda_nao", label: "Ainda não tocamos nisso." },
    ],
  },
  {
    id: "t.estranho",
    applies: (answers) => answers["t.contato"] === "estranho",
    intros: () => [],
    question: () => "Quando o assunto do término aparece, o que acontece?",
    options: () => [
      { id: "esfria", label: "A conversa esfria e para." },
      { id: "evita", label: "A gente conversa, mas evita falar do que aconteceu." },
      { id: "discussao", label: "Quando falamos disso, vira discussão." },
      { id: "nao_tentou", label: "A gente ainda não tentou falar sobre isso." },
    ],
  },
  {
    id: "t.pararam",
    applies: (answers) => answers["t.contato"] === "nenhum",
    intros: () => [],
    question: () => "Como esse contato terminou?",
    options: (_answers, pronouns) => [
      { id: "pediu", label: `${pronouns.subjectCap} pediu que eu não procurasse mais.` },
      { id: "parou", label: "A gente foi parando de conversar." },
      { id: "eu_parei", label: "Eu parei de procurar." },
      { id: "nao_sei", label: "Não sei explicar direito." },
    ],
  },
  {
    id: "t.quem",
    applies: (answers) => contact(answers),
    intros: () => [],
    question: () => "Hoje, quem costuma procurar primeiro?",
    options: (_answers, pronouns) => [
      { id: "eu", label: "Quase sempre eu." },
      { id: "ele", label: `Quase sempre ${pronouns.subject}.` },
      { id: "dois", label: "Os dois procuram." },
      { id: "motivo", label: "O contato acontece só por algum motivo específico." },
    ],
  },
  {
    id: "t.tentou",
    applies: (answers) => Boolean(answers["t.quem"] || answers["t.pararam"]),
    intros: () => [],
    question: () => "O que você já tentou depois do término?",
    options: (answers, pronouns) => {
      if (answers["t.contato"] === "nenhum" && answers["t.pararam"] === "pediu") {
        return [
          { id: "afastar", label: "Tentei me afastar." },
          { id: "redes", label: "Olho as redes." },
          { id: "escreve", label: "Escrevo e não envio." },
          { id: "nao_sei", label: "Ainda não sei como lidar." },
        ];
      }
      return [
        { id: "voltar", label: `Perguntei se ${pronouns.subject} queria voltar.` },
        { id: "aconteceu", label: "Tentei falar sobre o que aconteceu." },
        { id: "leve", label: "Mantive uma conversa mais leve." },
        { id: "nada", label: "Ainda não fiz nada." },
      ];
    },
  },
  {
    id: "t.desejo",
    applies: (answers) => Boolean(answers["t.tentou"]),
    intros: () => [],
    question: () => "E hoje, o que você quer de verdade?",
    options: (answers, pronouns) => [
      answers["t.tentou"] === "voltar"
        ? { id: "de_novo", label: "Quero tentar de novo, mas de outro jeito." }
        : { id: "voltar", label: `Quero tentar voltar com ${pronouns.subject}.` },
      { id: "abertura", label: "Quero saber se ainda existe abertura." },
      { id: "seguir", label: "Quero entender se é melhor seguir em frente." },
    ],
  },
  {
    id: "n.viu",
    applies: (answers) => answers.scenario === "N",
    intros: () => [],
    question: () => "O que te fez perceber que a pessoa não sente o mesmo?",
    options: (_answers, pronouns) => [
      { id: "disse", label: `${pronouns.subjectCap} me disse claramente que não tem interesse.` },
      { id: "silencio", label: "Falei o que sentia e não tive resposta." },
      { id: "agia", label: "Fui percebendo pela forma como agia." },
      { id: "incerto", label: "Acho que é isso, mas nunca ficou claro." },
    ],
  },
  {
    id: "i.relacao",
    applies: (answers) => interestPath(answers),
    intros: () => [],
    question: () => "Como vocês se relacionam hoje?",
    options: () => [
      { id: "frequente", label: "Conversamos com frequência." },
      { id: "as_vezes", label: "De vez em quando." },
      { id: "quase", label: "Quase não conversamos." },
      { id: "nunca", label: "Ainda não conversamos." },
    ],
  },
  {
    id: "i.quem",
    applies: (answers) => interestPath(answers) && answers["i.relacao"] !== "nunca" && Boolean(answers["i.relacao"]),
    intros: () => [],
    question: () => "Quem costuma puxar assunto?",
    options: () => [
      { id: "eu", label: "Eu." },
      { id: "outra", label: "A outra pessoa." },
      { id: "dois", label: "Os dois." },
      { id: "encontro", label: "Começa quando nos encontramos." },
    ],
  },
  {
    id: "i.situacao",
    applies: (answers) => interestPath(answers) && answers["i.relacao"] === "nunca",
    intros: () => [],
    question: () => "Existe uma situação natural em que vocês se encontram?",
    options: () => [
      { id: "convivemos", label: "Sim, convivemos." },
      { id: "comum", label: "Temos pessoas em comum." },
      { id: "redes", label: "Só conheço pelas redes." },
      { id: "nao_sei", label: "Não sei." },
    ],
  },
  {
    id: "i.duvida",
    applies: (answers) => interestPath(answers) && Boolean(answers["i.quem"]),
    intros: () => [],
    question: () => "O que mais te deixa na dúvida?",
    options: (answers) => {
      const options = [
        { id: "esfria", label: "Às vezes flui e depois esfria." },
        { id: "nunca_falamos", label: "Nunca falamos de interesse." },
        { id: "nao_identifiquei", label: "Ainda não identifiquei." },
      ];
      if (answers["i.quem"] !== "outra" && answers["i.quem"] !== "dois") {
        options.splice(2, 0, { id: "iniciativa", label: "A iniciativa fica comigo." });
      }
      return options;
    },
  },
  {
    id: "i.dificil",
    applies: (answers) => interestPath(answers) && Boolean(answers["i.situacao"]),
    intros: () => [],
    question: () => "O que torna o primeiro contato difícil?",
    options: () => [
      { id: "dizer", label: "Não sei o que dizer." },
      { id: "expor", label: "Receio de me expor." },
      { id: "abertura", label: "Não sei se há abertura." },
    ],
  },
  {
    id: "i.limite",
    applies: (answers) => interestPath(answers) && Boolean(answers["i.duvida"] || answers["i.dificil"]),
    intros: () => [],
    question: (_answers, pronouns) => `${pronouns.subjectCap} já disse claramente que não tem interesse ou pediu para você não procurar?`,
    options: () => [
      { id: "sim", label: "Sim." },
      { id: "nao", label: "Não." },
      { id: "nao_sei", label: "Não sei." },
    ],
  },
  {
    id: "i.desejo",
    applies: (answers) => interestPath(answers) && (answers["i.limite"] === "nao" || answers["i.limite"] === "nao_sei"),
    intros: () => [],
    question: () => "O que você quer fazer com essa dúvida?",
    options: (answers) => [
      { id: "interesse", label: "Quero saber se demonstra interesse de verdade." },
      { id: "aproximar", label: "Quero me aproximar sem parecer insistente." },
      answers["i.relacao"] === "nunca"
        ? { id: "comecar", label: "Quero saber como começar uma conversa." }
        : { id: "falar", label: "Quero falar o que sinto." },
      { id: "expectativa", label: "Quero saber se é melhor não criar expectativa." },
    ],
  },
  {
    id: "n.contato",
    applies: (answers) => (answers.scenario === "N" && Boolean(answers["n.viu"]) && answers["n.viu"] !== "incerto") || answers["i.limite"] === "sim",
    intros: () => [],
    question: () => "Vocês ainda se veem ou se falam?",
    options: () => [
      { id: "frequente", label: "Convivemos com frequência." },
      { id: "as_vezes", label: "Às vezes." },
      { id: "nenhum", label: "Não temos contato." },
    ],
  },
  {
    id: "n.pesa",
    applies: (answers) => answers["n.contato"] === "frequente" || answers["n.contato"] === "as_vezes",
    intros: () => [],
    question: () => "O que pesa mais nesses encontros?",
    options: () => [
      { id: "sinais", label: "Procurar sinais de mudança." },
      { id: "amizade", label: "Agir como se fosse só amizade." },
      { id: "pensando", label: "Ficar pensando depois." },
    ],
  },
  {
    id: "n.volta",
    applies: (answers) => answers["n.contato"] === "nenhum",
    intros: () => [],
    question: () => "O que costuma trazer isso de volta?",
    options: () => [
      { id: "redes", label: "Redes sociais." },
      { id: "lembrancas", label: "Lembranças." },
      { id: "imaginar", label: "Imaginar o que poderia ter acontecido." },
    ],
  },
  {
    id: "n.tentou",
    applies: (answers) => Boolean(answers["n.pesa"] || answers["n.volta"]),
    intros: () => [],
    question: () => "O que você já tentou para lidar com isso?",
    options: () => [
      { id: "afastar", label: "Me afastar um pouco." },
      { id: "amizade", label: "Manter amizade." },
      { id: "redes", label: "Parar de acompanhar as redes." },
      { id: "nao_sei", label: "Ainda não sei." },
    ],
  },
  {
    id: "n.desejo",
    applies: (answers) => Boolean(answers["n.tentou"]),
    intros: () => [],
    question: () => "O que você mais precisa agora?",
    options: () => [
      { id: "esperar", label: "Parar de esperar que a pessoa mude de ideia." },
      { id: "conviver", label: "Conseguir conviver sem ficar procurando sinais." },
      { id: "afastar", label: "Me afastar sem ficar voltando para a mesma história." },
      { id: "insistindo", label: "Entender se ainda estou insistindo numa resposta que já recebi." },
      { id: "tentar", label: "Ainda quero tentar, mesmo sabendo da resposta." },
    ],
  },
  {
    id: "g.meta",
    applies: (answers) => Boolean(answers["t.desejo"] || answers["r.desejo"] || answers["i.desejo"] || answers["n.desejo"]),
    intros: () => [],
    question: () => "O que a orientação precisa te responder?",
    options: (answers) => {
      if (answers.scenario === "T") {
        return [
          { id: "talk_about_return", label: "Quero saber se devo falar sobre voltar." },
          { id: "observe_real_opening", label: "Quero saber se existe abertura de verdade." },
          { id: "changes_before_return", label: "Quero saber o que precisaria mudar." },
          { id: "should_i_keep_trying", label: "Quero saber se ainda vale tentar." },
          { id: "how_to_move_forward", label: "Quero saber como seguir em frente." },
        ];
      }
      if (answers.scenario === "R") {
        if (answers["r.falta"] === "tarefas") {
          return [
            { id: "share_tasks", label: "Quero saber como dividir o que está pesando." },
            { id: "evaluate_staying", label: "Quero saber se ainda vale continuar." },
          ];
        }
        if (answers["r.falta"] === "confianca") {
          return [
            { id: "rebuild_trust", label: "Quero saber se dá para reconstruir a confiança." },
            { id: "evaluate_staying", label: "Quero saber se ainda vale continuar." },
          ];
        }
        if (answers["r.falta"] === "conversa") {
          return [
            { id: "talk_without_fighting", label: "Quero saber como conversar sem brigar." },
            { id: "evaluate_staying", label: "Quero saber se ainda vale continuar." },
          ];
        }
        return [
          { id: "recover_closeness", label: "Quero saber como recuperar proximidade." },
          { id: "talk_without_fighting", label: "Quero saber como conversar sem brigar." },
          { id: "evaluate_staying", label: "Quero saber se ainda vale continuar." },
        ];
      }
      if (answers["n.desejo"] || answers["i.limite"] === "sim") {
        return [
          { id: "accept_the_answer", label: "Quero saber como aceitar a resposta." },
          { id: "stop_looking_for_signs", label: "Quero saber como parar de procurar sinais." },
          { id: "leave_the_cycle", label: "Quero saber como sair desse ciclo." },
          { id: "move_on_from_refusal", label: "Quero saber como seguir depois dessa resposta." },
        ];
      }
      if (answers.scenario === "I" || answers["n.viu"] === "incerto") {
        return [
          { id: "see_reciprocity", label: "Quero saber se existe reciprocidade." },
          { id: "approach_without_pressure", label: "Quero saber como me aproximar sem pressionar." },
          answers["i.relacao"] === "nunca"
            ? { id: "say_what_you_feel", label: "Quero saber como começar uma conversa." }
            : { id: "say_what_you_feel", label: "Quero saber como falar o que sinto." },
          { id: "avoid_one_sided_expectation", label: "Quero saber como não criar uma expectativa de um lado só." },
        ];
      }
      return [
        { id: "accept_the_answer", label: "Quero saber como aceitar a resposta." },
        { id: "stop_looking_for_signs", label: "Quero saber como parar de procurar sinais." },
        { id: "leave_the_cycle", label: "Quero saber como sair desse ciclo." },
        { id: "move_on_from_refusal", label: "Quero saber como seguir depois dessa resposta." },
      ];
    },
  },
];

export function quizPlan(answers: Answers): ResolvedStep[] {
  const pronouns = pronounsOf(addressOf(answers));
  const plan: ResolvedStep[] = [];
  for (const step of STEPS) {
    if (!step.applies(answers)) continue;
    plan.push({
      id: step.id,
      intros: step.intros(answers, pronouns),
      question: step.question(answers, pronouns),
      options: step.options(answers, pronouns),
    });
    if (!answers[step.id]) break;
  }
  return plan;
}

export function quizComplete(answers: Answers): boolean {
  const plan = quizPlan(answers);
  return plan.length > 0 && plan.every((step) => Boolean(answers[step.id]));
}
