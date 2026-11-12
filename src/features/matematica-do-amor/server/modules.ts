import { explicitLimit, hasContactAfterBreakup, neverTalked } from "../domain/facts";
import type { Answers } from "../domain/types";
import type { Pronouns } from "../domain/pronouns";

export type ModuleCopy = {
  id: string;
  priority: number;
  evidenceKeys: string[];
  insight: string;
  explanation: string;
  action: string;
  script: string | null;
  observe: string[];
  ifThen: string[];
  limit: string;
  reflection: string;
};

export type ModuleContext = {
  answers: Answers;
  pronouns: Pronouns;
  relation: string;
};

const willing = (pronouns: Pronouns) =>
  pronouns.id === "ela" ? "disposta a" : pronouns.id === "ele" ? "disposto a" : "a fim de";

function attempt(answers: Answers): string {
  const map: Record<string, string> = {
    conversar: "conversar sobre o problema",
    espaco: "dar mais espaço",
    tempo: "propor um tempo juntos",
    combinado: "combinar uma mudança concreta",
    nao_sei: "esperar um caminho aparecer",
    termino: "tocar no término",
    leve: "manter a conversa leve",
    voltar: "perguntar sobre voltar",
    observar: "só observar",
    afastar: "se afastar um pouco",
    amizade: "manter amizade",
    redes: "parar de acompanhar as redes",
  };
  return map[answers["r.tentou"] ?? answers["t.tentou"] ?? answers["n.tentou"] ?? ""] ?? "tentar de um jeito parecido";
}

export function selectModules(answers: Answers): { main: string; complements: string[] } {
  if (answers.risco === "sim") return { main: "SEGURANCA", complements: [] };
  const ranked = MODULES.filter((item) => item.applies(answers) && !item.excludes(answers)).sort(
    (left, right) => right.priority - left.priority || left.id.localeCompare(right.id),
  );
  const main = ranked[0]?.id ?? "ESCLARECER";
  const complements = ranked
    .filter((item) => item.id !== main && compatible(main, item.id, answers))
    .slice(0, 2)
    .map((item) => item.id);
  return { main, complements };
}

function compatible(main: string, other: string, answers: Answers): boolean {
  if (main === "SEGURANCA" || other === "SEGURANCA") return false;
  if ((main === "T-SEMCONTATO" || main === "N-LIMITE") && (other.startsWith("T-ABERTURA") || other.startsWith("I-"))) return false;
  if (other === "R-ROTINA" && (answers["r.falta"] !== "tempo" && answers["r.falta"] !== "carinho")) return false;
  if (other === "R-ROTINA" && (main === "R-ESPACO" || main === "R-CONFIANCA" || main === "R-TAREFAS")) return false;
  if (other === "R-ESPACO") return false;
  return true;
}

const MODULES: Array<{ id: string; priority: number; applies: (answers: Answers) => boolean; excludes: (answers: Answers) => boolean }> = [
  {
    id: "T-SEMCONTATO",
    priority: 80,
    applies: (answers) => answers.scenario === "T" && (!hasContactAfterBreakup(answers) || explicitLimit(answers)),
    excludes: () => false,
  },
  {
    id: "N-LIMITE",
    priority: 70,
    applies: (answers) => answers.scenario === "N" || answers["i.limite"] === "sim",
    excludes: (answers) => answers["n.viu"] === "incerto" && answers["i.limite"] !== "sim",
  },
  {
    id: "R-ESPACO",
    priority: 60,
    applies: (answers) => answers.scenario === "R" && answers["r.distancia"] === "procura" && (answers["r.pedido"] === "sim" || answers["r.pedido"] === "parecido"),
    excludes: (answers) => (answers["r.distancia"] === "espera" || answers["r.distancia"] === "afasto") && answers["r.efeito"] === "preciso_retomar",
  },
  {
    id: "R-CONFIANCA",
    priority: 55,
    applies: (answers) => answers["r.falta"] === "confianca",
    excludes: () => false,
  },
  {
    id: "R-TAREFAS",
    priority: 50,
    applies: (answers) => answers["r.falta"] === "tarefas",
    excludes: () => false,
  },
  {
    id: "R-RECIPROCIDADE",
    priority: 45,
    applies: (answers) =>
      answers.scenario === "R" &&
      (answers["r.efeito"] === "preciso_retomar" ||
        answers["r.efeito"] === "distancia_aumenta" ||
        answers["r.acordo_tarefas"] === "so_eu" ||
        answers["r.acordo_geral"] === "so_eu" ||
        answers["r.acordo_confianca"] === "promessa" ||
        answers["r.fala"] === "sem_mudanca"),
    excludes: () => false,
  },
  {
    id: "R-CONVERSA",
    priority: 40,
    applies: (answers) =>
      answers.scenario === "R" && (answers["r.falta"] === "conversa" || answers["r.fala"] === "briga" || answers["r.fala"] === "adia"),
    excludes: () => false,
  },
  {
    id: "R-ROTINA",
    priority: 35,
    applies: (answers) => answers.scenario === "R" && (answers["r.falta"] === "tempo" || answers["r.falta"] === "carinho") && !explicitLimit(answers),
    excludes: () => false,
  },
  {
    id: "I-INICIO",
    priority: 30,
    applies: (answers) => (answers.scenario === "I" || answers["n.viu"] === "incerto") && neverTalked(answers) && answers["i.limite"] !== "sim",
    excludes: () => false,
  },
  {
    id: "I-RECIPROCIDADE",
    priority: 30,
    applies: (answers) => (answers.scenario === "I" || answers["n.viu"] === "incerto") && !neverTalked(answers) && answers["i.limite"] !== "sim" && answers["i.relacao"] !== undefined,
    excludes: () => false,
  },
  {
    id: "T-ABERTURA",
    priority: 30,
    applies: (answers) => answers.scenario === "T" && hasContactAfterBreakup(answers) && !explicitLimit(answers),
    excludes: () => false,
  },
];

export function moduleCopy(id: string, ctx: ModuleContext): ModuleCopy {
  const { answers, pronouns, relation } = ctx;
  const tried = attempt(answers);
  const already = answers["r.tentou"];
  if (id === "SEGURANCA") {
    return {
      id,
      priority: 100,
      evidenceKeys: ["risco"],
      insight: "Se existe medo, ameaça ou violência, a prioridade é a sua segurança, não uma técnica de conversa.",
      explanation: "Esta leitura não vai orientar reconquista nem interpretar números como se isso resolvesse uma situação de risco. Procure uma pessoa ou um serviço de confiança.",
      action: "Afaste-se do contato que te coloca em risco e peça ajuda a alguém de confiança.",
      script: null,
      observe: ["Você está em segurança agora?", "Existe alguém que possa te acompanhar?", "Você sabe qual serviço local pode te orientar?"],
      ifThen: ["Se o risco continua, priorize ajuda presencial.", "Se você puder se afastar, faça isso antes de qualquer conversa."],
      limit: "Nenhum número justifica permanecer numa situação de medo.",
      reflection: "Quem pode te apoiar hoje, fora desta história?",
    };
  }
  if (id === "R-ESPACO") {
    return {
      id,
      priority: 60,
      evidenceKeys: ["r.distancia", "r.pedido"],
      insight: "Você busca mais contato quando sente distância, e contou que a pessoa já falou em espaço. Vale olhar se vocês estão tentando resolver necessidades diferentes na mesma conversa.",
      explanation: "Procurar outra vez pode ser uma tentativa de entender como vocês estão. Mas, pelo que você relatou, parte dessa procura chega à outra pessoa como cobrança. A mudança possível é tornar o pedido mais claro e combinar uma forma de contato que não deixe você precisando perguntar de novo. Isso exige participação dos dois.",
      action: "Escolher um momento calmo e negociar um acordo pequeno de presença e espaço, sem monitoramento.",
      script: "Eu percebi que tenho insistido quando sinto você distante. Quero mudar esse jeito de puxar assunto, mas também preciso sentir sua participação. Como a gente pode combinar um tempo para cada um e um momento nosso?",
      observe: [
        `${pronouns.subjectCap} também toma iniciativa?`,
        "A conversa chega num combinado?",
        "Você consegue dizer a necessidade sem repetir a pergunta na mesma situação?",
      ],
      ifThen: [
        "Se topar, definam um combinado específico escolhido pelos dois.",
        "Se disser que precisa pensar, combinem quando retomar.",
        "Se recusar qualquer participação, olhe para o que só você está sustentando, sem prometer que mais espaço resolva.",
      ],
      limit: "Dar espaço não significa aceitar uma relação em que só você procura.",
      reflection: "Qual presença você precisa pedir com clareza, em vez de tentar conseguir insistindo?",
    };
  }
  if (id === "R-RECIPROCIDADE") {
    return {
      id,
      priority: 45,
      evidenceKeys: ["r.efeito", "r.fala", "r.acordo_tarefas", "r.acordo_geral", "r.acordo_confianca"],
      insight: `Você já tentou ${tried}. A pergunta agora é o que a outra pessoa faz quando existe espaço para participar.`,
      explanation: "Se o esforço continua dependendo de você lembrar, iniciar e sustentar, mudar apenas suas palavras pode não resolver o que está faltando. Um acordo útil precisa de uma parte que a outra pessoa reconheça e assuma espontaneamente.",
      action: "Pedir uma participação concreta, escolhida em conjunto, e observar se ela acontece. Não há um prazo universal para decidir terminar.",
      script: `Eu quero melhorar isso com você. Já tentei ${tried}, e continuo sentindo falta da sua participação. O que você está ${willing(pronouns)} assumir de forma concreta?`,
      observe: ["Há iniciativa sem lembrete?", "O acordo é cumprido ou renegociado antes?", "Existe disponibilidade para ouvir?"],
      ifThen: [
        "Se houver uma proposta concreta, negociem algo realista.",
        "Se a resposta for vaga, pergunte qual atitude ela representa.",
        "Se não houver disposição, reflita sobre o que você aceita e precisa, sem uma ordem para terminar.",
      ],
      limit: "Você pode fazer um pedido claro. Não consegue cumprir a parte dos dois.",
      reflection: "O que precisaria acontecer na prática para você sentir que existe reciprocidade?",
    };
  }
  if (id === "R-ROTINA") {
    const repeated = already === "tempo";
    return {
      id,
      priority: 35,
      evidenceKeys: ["r.falta"],
      insight: "Você sente falta de proximidade. Vale distinguir estar no mesmo lugar de ter um momento em que os dois realmente participam.",
      explanation: repeated
        ? "Você já propôs um tempo juntos. A diferença agora é perguntar o que impediu e ajustar, em vez de repetir o mesmo convite como se fosse novidade."
        : "Se a convivência ficou ocupada só por assuntos práticos, um convite pequeno e possível pode ajudar a perceber como vocês respondem um ao outro. Não precisa ser uma grande surpresa: precisa haver escolha dos dois.",
      action: "Cada pessoa sugere uma forma viável de passar tempo junto. Vocês escolhem uma e combinam quando.",
      script: "Tô sentindo falta de um momento nosso. O que você gostaria que a gente fizesse junto e que caiba de verdade na nossa rotina?",
      observe: ["Há interesse em escolher?", "A participação aparece na prática?", "A concordância vem com disponibilidade?"],
      ifThen: [
        "Se o plano não cabe, escolham outro.",
        "Se toda proposta é recusada sem alternativa, a pergunta passa a ser participação, não um convite maior.",
      ],
      limit: "Um momento agradável não substitui resolver um problema que continua se repetindo.",
      reflection: "Que tipo de presença está fazendo falta: companhia, conversa ou carinho?",
    };
  }
  if (id === "R-TAREFAS") {
    return {
      id,
      priority: 50,
      evidenceKeys: ["r.falta", "r.peso", "r.acordo_tarefas"],
      insight: "O ponto que você trouxe é a divisão das responsabilidades. Um acordo só funciona quando fica claro quem assume cada parte, inclusive lembrar que ela existe.",
      explanation:
        answers["r.acordo_tarefas"] === "so_eu" || answers["r.acordo_tarefas"] === "volta"
          ? "Quando uma pessoa continua coordenando tudo, a execução pode até ser dividida, mas a responsabilidade ainda fica concentrada. Como já houve um acordo que não se sustentou, o foco passa a ser compromisso."
          : "Quando uma pessoa continua coordenando tudo, a execução pode até ser dividida, mas a responsabilidade ainda fica concentrada. Se o problema é falta de clareza, explicitar o acordo pode ajudar.",
      action: "Escolher uma responsabilidade que você já reconhece, definir quem assume do começo ao fim e quando vocês verificam se a divisão funcionou.",
      script: "Queria rever como a gente divide as responsabilidades. Podemos escolher uma parte que cada um assuma do começo ao fim, sem depender de eu ficar lembrando?",
      observe: ["A parte é assumida por inteiro?", "Quando não cabe, a pessoa renegocia?", "Você deixou de ser a única a lembrar?"],
      ifThen: [
        "Se ainda não havia acordo, construam o primeiro.",
        "Se o acordo se repete e não se cumpre, a questão é participação, não uma frase melhor.",
        "Se os dois cumprem e ainda assim parece injusto, revejam a carga.",
      ],
      limit: "A proposta não é você organizar ainda melhor o trabalho de todo mundo. É repartir a responsabilidade.",
      reflection: "O que você precisa deixar de coordenar para essa divisão ficar mais justa?",
    };
  }
  if (id === "R-CONVERSA") {
    const result =
      answers["r.fala"] === "briga" ? "a conversa vira discussão" : answers["r.fala"] === "adia" ? "o assunto é adiado" : "a conversa não chega a uma mudança";
    return {
      id,
      priority: 40,
      evidenceKeys: ["r.fala", "r.falta"],
      insight: `Você contou que ${result}. Vamos separar o assunto que precisa ser tratado do jeito como ele costuma começar.`,
      explanation: "Uma conversa fica mais concreta quando trata de um episódio, do efeito que ele tem em você e de um pedido possível. Isso não garante que a outra pessoa vá ouvir, mas permite expressar a necessidade sem transformar a relação numa acusação.",
      action: "Escolher um tema, descrever um fato e fazer um pedido. Evite sempre e nunca quando não forem necessários.",
      script: `Quando acontece o que você já descreveu sobre ${answers["r.falta"] === "conversa" ? "a conversa de vocês" : "essa falta"}, eu sinto falta de um jeito de tratar isso juntos. Queria conversar sobre uma mudança pequena que a gente consiga fazer. Você topa?`,
      observe: ["Há escuta?", "Aparecem perguntas?", "O tema volta depois de uma pausa?"],
      ifThen: [
        "Se a conversa escalar, pausem sem impor um prazo rígido.",
        "Se a pausa for aceita, combinem o retorno.",
        "Se o assunto repetidamente não volta, a pergunta é disponibilidade.",
      ],
      limit: "Uma frase cuidadosa não torna você responsável pela reação da outra pessoa.",
      reflection: "Qual é o pedido central que se perde quando a conversa vira uma lista de tudo que já aconteceu?",
    };
  }
  if (id === "R-CONFIANCA") {
    const fact = answers["r.atras"] === "quebrado";
    const changed = answers["r.atras"] === "comunicacao";
    return {
      id,
      priority: 55,
      evidenceKeys: ["r.falta", "r.atras"],
      insight: fact
        ? "Você relatou um combinado quebrado. Reconstruir confiança exige olhar para atitudes, além do que é prometido."
        : "Você relatou receio, mas não identificou um acontecimento concreto. A leitura não vai transformar essa dúvida em prova contra a outra pessoa.",
      explanation: fact
        ? "Uma conversa útil esclarece o que foi quebrado, o que cada um entende por reparação e quais compromissos são possíveis. Vigiar constantemente não equivale a reconstruir um acordo."
        : "Tente distinguir o que aconteceu do significado que você atribuiu. Uma mudança na comunicação permite perguntar o que mudou. Ela não confirma falta de amor nem traição.",
      action: fact ? "Falar do combinado quebrado e do que cada um pode fazer para reconstruí-lo." : "Perguntar o que mudou, sem transformar o receio em acusação.",
      script: fact
        ? "O que aconteceu mexeu com minha confiança. Preciso que a gente converse sobre o que cada um está disposto a fazer para reconstruir esse acordo."
        : changed
          ? "Percebi uma mudança na nossa comunicação e fiquei em dúvida sobre como estamos. Você percebeu isso também?"
          : "Essa situação tem me trazido insegurança e eu queria falar sobre o que me ajudaria a ter mais clareza.",
      observe: ["Há reconhecimento do que ocorreu, se ocorreu?", "O compromisso fica claro?", "A conversa evita vigilância?"],
      ifThen: ["Se faltam detalhes, o caminho é esclarecer.", "Se as promessas se repetem sem atitude, a pergunta é participação."],
      limit: "Os números não identificam mentira ou infidelidade.",
      reflection: "Que atitude concreta ajudaria a reconstruir confiança sem transformar a relação em vigilância?",
    };
  }
  if (id === "T-ABERTURA") {
    const untreated = answers["t.falaram"] !== "sim";
    return {
      id,
      priority: 30,
      evidenceKeys: ["t.contato", "t.falaram", "t.limite"],
      insight: "Vocês estão conversando. Isso permite observar a participação dos dois, mas ainda não responde se existe vontade de retomar a relação.",
      explanation: untreated
        ? "Se o motivo do término ainda não foi conversado, uma possível aproximação precisa abrir espaço para esse assunto. Conversa agradável e disposição para reconstruir são informações distintas."
        : "Vocês já falaram do que aconteceu. A próxima pergunta é o que ambos fariam diferente, não se a conversa em si significa uma volta.",
      action: "Fazer um convite claro, sem uma sequência de cobranças, e deixar espaço para uma resposta negativa.",
      script: untreated
        ? "Gostei de voltar a conversar com você. Pra mim, ficou uma coisa em aberto sobre como a gente terminou. Você toparia falar disso?"
        : "A gente falou sobre o que aconteceu. Antes de pensar em tentar de novo, queria entender o que cada um realmente estaria disposto a mudar.",
      observe: ["A iniciativa é dos dois?", "Há resposta ao convite?", "O motivo do término cabe na conversa?"],
      ifThen: [
        "Se aceitar conversar, escolham um tema.",
        "Se a resposta for vaga, não transforme em sim.",
        "Se recusar, o limite passa na frente de qualquer novo convite.",
      ],
      limit: "Nenhum número confirma que a pessoa quer voltar.",
      reflection: "Você quer retomar a relação que existia ou só faria sentido voltar se algo mudasse?",
    };
  }
  if (id === "T-SEMCONTATO") {
    const distance = explicitLimit(answers) || answers["t.pararam"] === "distancia";
    return {
      id,
      priority: 80,
      evidenceKeys: ["t.contato", "t.pararam", "t.limite"],
      insight: distance
        ? "Você contou que a pessoa pediu distância. A leitura pode ajudar a organizar o que ficou em você, sem transformar a saudade numa obrigação de procurar."
        : "Você contou que não há contato. A leitura pode ajudar a organizar o que ficou em você, sem transformar a saudade numa obrigação de procurar.",
      explanation: "O que fica em aberto pode envolver falta da convivência, perguntas sem resposta ou uma expectativa sobre um futuro que você imaginou. Separar essas coisas ajuda a perceber qual necessidade aparece quando bate vontade de mandar mensagem. Não precisamos fingir que sabemos o motivo da outra pessoa.",
      action: "Escrever para si, sem enviar: o que sinto falta, o que realmente aconteceu e o que eu precisaria numa relação que me faça bem.",
      script: "Eu posso sentir falta e ainda respeitar o limite que existe agora. A vontade de procurar não precisa virar uma ação imediata.",
      observe: ["Que situação desperta a vontade?", "O que ajuda a atravessá-la?", "A tentativa anterior trouxe mais sofrimento?"],
      ifThen: [
        "Se o gatilho são as redes, reduza essa exposição.",
        "Se a vontade aparece numa conversa aberta, saia do aplicativo e escolha outra atividade concreta.",
        "Se o que falta é uma resposta, anote a pergunta e veja o que depende de você.",
      ],
      limit: "A leitura não dá uma data para a volta e não recomenda contornar um pedido de distância.",
      reflection: "Qual parte dessa história você ainda está tentando resolver sozinho?",
    };
  }
  if (id === "I-INICIO") {
    const context =
      answers["i.situacao"] === "convivemos"
        ? "No lugar em que vocês já se encontram, um comentário simples basta."
        : answers["i.situacao"] === "comum"
          ? "Uma apresentação natural, por alguém em comum, é o contexto que você descreveu."
          : answers["i.situacao"] === "redes"
            ? "Se for pelas redes, a mensagem precisa ser sobre algo que a pessoa publicou e que você realmente viu. Não invente o assunto."
            : "Sem um contexto que você reconheça, não vou inventar um encontro.";
    return {
      id,
      priority: 30,
      evidenceKeys: ["i.relacao", "i.situacao"],
      insight: "Como vocês ainda não conversaram, não temos elementos para falar de reciprocidade. O primeiro passo é criar uma oportunidade respeitosa de conversa, se existir um contexto adequado.",
      explanation: "Os temas dos números ajudam a refletir sobre como você prefere se aproximar. A resposta real da pessoa só pode aparecer numa interação, e ela pode ou não ter interesse. Um início simples permite descobrir isso sem colocar toda a expectativa no primeiro contato.",
      action: context,
      script:
        answers["i.situacao"] === "redes"
          ? "Oi! Tudo bem? Quis te chamar para conversar, se você tiver vontade também."
          : "Oi! A gente se encontra por aqui, mas ainda não teve muita chance de conversar. Tudo bem?",
      observe: ["A resposta é voluntária?", "A pessoa participa da conversa?", "Você consegue parar se não houver resposta?"],
      ifThen: ["Se responder e participar, a conversa pode continuar.", "Se não responder, não encadeie mensagens.", "Se recusar, respeite."],
      limit: "Um primeiro contato não precisa provar o futuro dessa história.",
      reflection: "Você consegue fazer um convite deixando espaço para uma resposta diferente da que deseja?",
    };
  }
  if (id === "I-RECIPROCIDADE") {
    const who =
      answers["i.quem"] === "eu"
        ? "quem puxa assunto é você"
        : answers["i.quem"] === "outra"
          ? "quem puxa assunto é a outra pessoa"
          : answers["i.quem"] === "dois"
            ? "os dois puxam assunto"
            : "a conversa começa quando vocês se encontram";
    return {
      id,
      priority: 30,
      evidenceKeys: ["i.relacao", "i.quem", "i.duvida"],
      insight: `Você contou que ${who}. Para sair da dúvida, vale observar como a outra pessoa participa, além de interpretar uma mensagem isolada.`,
      explanation: "Participar pode aparecer em perguntas, iniciativa e disponibilidade para continuar um assunto ou aceitar um convite. Nenhum desses sinais sozinho confirma interesse amoroso. O que traz mais clareza é uma combinação de atitudes e, quando houver contexto, uma conversa direta.",
      action:
        answers["i.quem"] === "eu"
          ? "Fazer um convite claro e não insistir se a resposta não vier."
          : answers["i.quem"] === "dois" || answers["i.quem"] === "outra"
            ? "Se os dois já participam da conversa, uma forma simples de interesse cabe melhor do que supor que só você inicia."
            : "Observar se a conversa continua antes de supor um motivo.",
      script: "Gosto de conversar com você. Você teria vontade de fazer alguma coisa comigo, só nós dois?",
      observe: ["Aceita ou propõe alternativa?", "Participa da organização?", "Uma resposta vaga continua vaga?"],
      ifThen: ["Se aceitar, combinem.", "Se estiver indisponível e oferecer alternativa, avalie a proposta.", "Se não quiser ou não responder, não insista."],
      limit: "Reciprocidade não precisa ser medida por jogo de silêncio ou ciúme.",
      reflection: "Qual atitude da outra pessoa existe de fato, e qual parte ainda é expectativa sua?",
    };
  }
  if (id === "N-LIMITE") {
    const refused = answers["n.viu"] === "disse" || answers["i.limite"] === "sim";
    const together = answers["n.contato"] === "frequente" || answers["n.contato"] === "as_vezes";
    return {
      id,
      priority: 70,
      evidenceKeys: ["n.viu", "i.limite", "n.contato"],
      insight: refused
        ? "A pessoa já disse que não tem interesse. O ponto que você trouxe agora é como lidar com o que continua sentindo."
        : "Você não recebeu a resposta que esperava. Isso não permite saber o que a pessoa sente, mas permite escolher não continuar insistindo sem retorno.",
      explanation: "É possível compreender uma resposta e ainda demorar para se desprender da expectativa. A leitura pode ajudar a separar a pessoa real, a história que aconteceu e a relação que você imaginou. Isso não diminui o que você sente.",
      action: together
        ? "Definir uma forma de contato suportável, sem procurar sinais em toda interação."
        : "Reduzir um lembrete que mantém a espera e retomar uma atividade ou um plano seu.",
      script: refused
        ? "Eu não preciso convencer essa pessoa para reconhecer o valor do que eu sinto. Posso escolher como cuidar de mim diante da resposta que tenho."
        : "Eu não preciso insistir sem retorno para reconhecer o que eu sinto. Posso escolher o que fazer com essa espera.",
      observe: ["A estratégia reduz a espera?", "Cada encontro vira um novo teste?", "Você consegue manter o limite que escolheu?"],
      ifThen: [
        answers["n.tentou"] === "afastar"
          ? "Você já tentou se afastar. Ajuste um gatilho específico, em vez de repetir um conselho vago."
          : "Se ainda não tentou se afastar, escolha um lembrete concreto para reduzir.",
        "Se precisa conviver, mantenha a cordialidade e o limite que for possível.",
        "Se a recusa foi explícita, nenhuma técnica de conquista entra nesta leitura.",
      ],
      limit: "A combinação dos números não cancela uma resposta que a pessoa já deu.",
      reflection: "O que você pode voltar a escolher por você, mesmo sem receber uma resposta diferente?",
    };
  }
  return {
    id: "ESCLARECER",
    priority: 1,
    evidenceKeys: ["scenario"],
    insight: `No ${relation}, o que dá para afirmar é só o que você marcou. O restante fica como pergunta.`,
    explanation: "Sem um fato mais específico, a leitura não acusa ninguém. Ela ajuda a formular um pedido claro e a ver se existe participação.",
    action: "Escolher uma necessidade e perguntar se a outra pessoa topa olhar para ela.",
    script: "Queria conversar sobre uma coisa que está pesando pra mim. Você topa escolher um momento curto para isso?",
    observe: ["A pessoa escuta?", "Existe uma proposta?", "O assunto volta?"],
    ifThen: ["Se topar, definam um único ponto.", "Se não topar, o limite é a participação, não uma frase melhor."],
    limit: "Você pode esclarecer o seu pedido. Não pode cumprir a parte da outra pessoa.",
    reflection: "Qual pedido cabe numa frase?",
  };
}
