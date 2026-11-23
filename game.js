/* =========================================================
   DESKTOP PIXEL — game.js
   Dados dos termos, estado salvo (localStorage), XP,
   conquistas, mensagens e sons (Web Audio API).
   ========================================================= */
"use strict";

/* ---------- Os 16 termos de Arquitetura Computacional ----------
   pista     → usada na cruzadinha (máx. 15 palavras, sem entregar a resposta)
   pergunta  → frente do flashcard
   titulo / explicacao → verso do flashcard                       */
const TERMOS = [
  {
    id: "CPU", titulo: "CPU",
    pista: "Cérebro do computador: busca, decodifica e executa as instruções dos programas.",
    pergunta: "Qual componente é o “cérebro” do computador, que busca, decodifica e executa as instruções?",
    explicacao: "Unidade Central de Processamento. Reúne ULA, UC e registradores e repete o ciclo busca → decodificação → execução.",
  },
  {
    id: "ULA", titulo: "ULA",
    pista: "Parte do processador que realiza cálculos e comparações com os dados.",
    pergunta: "Qual parte do processador faz as operações aritméticas (soma, subtração) e lógicas (AND, OR, comparações)?",
    explicacao: "Unidade Lógica e Aritmética. Recebe os operandos dos registradores e devolve o resultado e as flags (zero, carry...).",
  },
  {
    id: "UC", titulo: "UC",
    pista: "Coordena o processador, interpretando instruções e enviando sinais às outras partes.",
    pergunta: "Qual parte da CPU interpreta as instruções e gera os sinais que coordenam os outros componentes?",
    explicacao: "Unidade de Controle. Comanda o ciclo de instrução, dizendo à ULA, à memória e aos barramentos o que fazer a cada passo.",
  },
  {
    id: "REGISTRADORES", titulo: "Registradores", memoria: true,
    pista: "Pequenas memórias dentro do processador, as mais rápidas, que guardam valores em uso.",
    pergunta: "Quais são as memórias mais rápidas do sistema, localizadas dentro da própria CPU?",
    explicacao: "Registradores. Guardam dados e endereços em uso imediato (ex.: contador de programa, acumulador). Capacidade muito pequena.",
  },
  {
    id: "RAM", titulo: "RAM", memoria: true,
    pista: "Memória principal e volátil onde ficam os programas em execução.",
    pergunta: "Qual memória principal e volátil guarda os programas e dados em uso enquanto o computador está ligado?",
    explicacao: "Random Access Memory (memória de acesso aleatório). Perde todo o conteúdo quando a energia é desligada.",
  },
  {
    id: "ROM", titulo: "ROM", memoria: true,
    pista: "Memória não volátil gravada na fábrica, que normalmente não pode ser alterada.",
    pergunta: "Qual memória não volátil já vem gravada de fábrica e, em geral, só pode ser lida?",
    explicacao: "Read Only Memory (memória somente de leitura). Guarda firmware e rotinas de inicialização do equipamento.",
  },
  {
    id: "EEPROM", titulo: "EEPROM", memoria: true,
    pista: "Memória permanente regravável byte a byte, boa para guardar configurações pequenas.",
    pergunta: "Qual memória não volátil pode ser apagada e regravada eletricamente, byte a byte?",
    explicacao: "Electrically Erasable Programmable ROM. Muito usada para guardar configurações em microcontroladores; aceita um número limitado de regravações.",
  },
  {
    id: "FLASH", titulo: "Flash", memoria: true,
    pista: "Memória não volátil regravada em blocos, usada em pendrives e cartões de memória.",
    pergunta: "Qual tecnologia de memória não volátil é apagada em blocos e usada em pendrives, SSDs e cartões?",
    explicacao: "Memória Flash. Derivada da EEPROM, apaga em blocos inteiros, o que a deixa mais rápida e barata para grandes capacidades.",
  },
  {
    id: "CACHE", titulo: "Cache", memoria: true,
    pista: "Memória pequena e muito rápida que fica entre o processador e a principal.",
    pergunta: "Qual memória pequena e muito rápida fica entre a CPU e a RAM, guardando os dados mais usados?",
    explicacao: "Cache. Organizada em níveis (L1, L2, L3), reduz o tempo que a CPU espera pela memória principal.",
  },
  {
    id: "MEMORIADEMASSA", titulo: "Memória de massa", memoria: true,
    pista: "Onde os arquivos ficam guardados de forma permanente e em grande quantidade, como HD.",
    pergunta: "Como se chama o armazenamento não volátil de grande capacidade, como HD e SSD?",
    explicacao: "Memória de massa (armazenamento secundário). Mais lenta que a RAM, mas mantém arquivos e programas mesmo desligada.",
  },
  {
    id: "DMA", titulo: "DMA",
    pista: "Recurso que deixa periféricos moverem dados sem precisar passar pelo processador.",
    pergunta: "Qual recurso permite que periféricos troquem dados direto com a memória sem ocupar a CPU?",
    explicacao: "Direct Memory Access (acesso direto à memória). Um controlador faz a transferência e avisa a CPU por interrupção ao terminar.",
  },
  {
    id: "ADDRESSBUS", titulo: "Address bus",
    pista: "Linhas que indicam qual posição da memória o processador quer acessar.",
    pergunta: "Qual barramento transporta a posição de memória (ou de E/S) que a CPU quer acessar?",
    explicacao: "Barramento de endereço. É unidirecional (sai da CPU) e sua largura define quanta memória pode ser endereçada.",
  },
  {
    id: "DATABUS", titulo: "Data bus",
    pista: "Linhas por onde as informações trafegam entre processador, memória e periféricos.",
    pergunta: "Qual barramento transporta os próprios dados entre CPU, memória e periféricos?",
    explicacao: "Barramento de dados. É bidirecional; sua largura (8, 16, 32, 64 bits) define quanto é transferido de uma vez.",
  },
  {
    id: "MICROCONTROLADOR", titulo: "Microcontrolador",
    pista: "Chip que reúne processador, memória e periféricos, usado em sistemas embarcados.",
    pergunta: "Que chip reúne CPU, memória e periféricos de E/S para controlar sistemas embarcados?",
    explicacao: "Microcontrolador. Um computador completo num único chip, presente em placas Arduino, eletrodomésticos e carros.",
  },
  {
    id: "DUALCORE", titulo: "Dual core",
    pista: "Processador com duas unidades de processamento independentes no mesmo chip.",
    pergunta: "Como se chama um processador com dois núcleos independentes no mesmo chip?",
    explicacao: "Dual core. Os dois núcleos executam tarefas em paralelo, melhorando o desempenho em multitarefa.",
  },
  {
    id: "QUADCORE", titulo: "Quad core",
    pista: "Processador com quatro unidades de processamento independentes no mesmo chip.",
    pergunta: "Como se chama um processador com quatro núcleos independentes no mesmo chip?",
    explicacao: "Quad core. Quatro núcleos em paralelo; os programas precisam dividir o trabalho para aproveitar todos.",
  },
];

const XP_PALAVRA = 100;
const XP_CARTAO = 50;

const CONQUISTAS = [
  { id: "primeiro", icone: "★", nome: "Primeiro acerto", desc: "Acerte sua primeira resposta." },
  { id: "cinco", icone: "✦", nome: "Cinco respostas corretas", desc: "Some 5 acertos entre cruzadinha e flashcards." },
  { id: "memorias", icone: "▣", nome: "Mestre das memórias", desc: "Acerte na cruzadinha as 7 palavras sobre memória." },
  { id: "sistema", icone: "⚡", nome: "Sistema restaurado", desc: "Complete a cruzadinha inteira." },
  { id: "baralho", icone: "♠", nome: "Memória fotográfica", desc: "Acerte os 16 flashcards." },
  { id: "gato", icone: "♥", nome: "Amigo felino", desc: "Faça carinho no gatinho." },
  { id: "cafe", icone: "☕", nome: "Movido a café", desc: "Tome 3 cafés com o personagem." },
];

const INCENTIVOS = [
  "Mandou bem! Seu processador está a todo vapor.",
  "Isso aí! Mais um dado gravado na memória.",
  "Excelente! Cache cheio de conhecimento.",
  "Boa! O barramento de ideias está livre.",
  "Acertou! Clock subindo!",
  "Perfeito! Nenhum bit fora do lugar.",
];

const CONSOLOS = [
  "Quase! Releia a pista com calma.",
  "Sem problemas: errar também é aprender.",
  "Hmm... que tal revisar nos flashcards?",
  "Respira, toma um café e tenta de novo.",
];

/* =========================================================
   Estado e salvamento
   ========================================================= */
const SAVE_KEY = "desktopPixel.save.v1";

function estadoInicial() {
  return {
    xp: 0,
    conquistas: [],
    cafes: 0,
    app: "cruzadinha",
    clima: "chuva",
    cruzadinha: { letras: {}, premiadas: [], conferido: false },
    flashcards: { indice: 0, resultados: {}, premiadas: [] },
  };
}

function carregarEstado() {
  try {
    const bruto = localStorage.getItem(SAVE_KEY);
    if (!bruto) return estadoInicial();
    const salvo = JSON.parse(bruto);
    const base = estadoInicial();
    return {
      ...base,
      ...salvo,
      cruzadinha: { ...base.cruzadinha, ...(salvo.cruzadinha || {}) },
      flashcards: { ...base.flashcards, ...(salvo.flashcards || {}) },
    };
  } catch (erro) {
    return estadoInicial();
  }
}

let Estado = carregarEstado();

const Jogo = {
  existeSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (erro) {
      return false;
    }
  },

  salvar() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(Estado));
    } catch (erro) {
      /* sem localStorage (modo privado): o jogo continua sem salvar */
    }
  },

  apagarSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (erro) { /* ignora */ }
    Estado = estadoInicial();
  },

  totalAcertos() {
    return Estado.cruzadinha.premiadas.length + Estado.flashcards.premiadas.length;
  },

  totalPossivel() {
    return TERMOS.length * 2;
  },

  ganharXP(quantidade, motivo) {
    Estado.xp += quantidade;
    this.salvar();
    this.atualizarHUD();
    this.toast(`+${quantidade} XP <span>· ${motivo}</span>`, "xp");
  },

  temConquista(id) {
    return Estado.conquistas.includes(id);
  },

  desbloquear(id) {
    if (this.temConquista(id)) return;
    const c = CONQUISTAS.find((x) => x.id === id);
    if (!c) return;
    Estado.conquistas.push(id);
    this.salvar();
    this.atualizarHUD();
    this.toast(`<b>${c.icone} CONQUISTA!</b><br>${c.nome}`, "conquista");
    Som.tocar("conquista");
  },

  verificarConquistas() {
    const total = this.totalAcertos();
    const premiadas = Estado.cruzadinha.premiadas;
    if (total >= 1) this.desbloquear("primeiro");
    if (total >= 5) this.desbloquear("cinco");
    const memorias = TERMOS.filter((t) => t.memoria).map((t) => t.id);
    if (memorias.every((id) => premiadas.includes(id))) this.desbloquear("memorias");
    if (premiadas.length === TERMOS.length) this.desbloquear("sistema");
    if (Estado.flashcards.premiadas.length === TERMOS.length) this.desbloquear("baralho");
    if (Estado.cafes >= 3) this.desbloquear("cafe");
  },

  incentivo() {
    return INCENTIVOS[Math.floor(Math.random() * INCENTIVOS.length)];
  },

  consolo() {
    return CONSOLOS[Math.floor(Math.random() * CONSOLOS.length)];
  },

  mensagem(texto) {
    const el = document.getElementById("mensagem");
    if (el) el.textContent = texto;
  },

  toast(html, tipo = "") {
    const caixa = document.getElementById("toasts");
    if (!caixa) return;
    const t = document.createElement("div");
    t.className = `toast ${tipo}`;
    t.innerHTML = html;
    caixa.appendChild(t);
    setTimeout(() => t.remove(), 3300);
  },

  atualizarHUD() {
    const total = this.totalAcertos();
    const possivel = this.totalPossivel();
    document.getElementById("hud-xp").textContent = Estado.xp;
    document.getElementById("hud-prog").textContent = `${total}/${possivel}`;
    document.getElementById("hud-barra").style.width = `${(total / possivel) * 100}%`;
    document.getElementById("hud-conq").textContent = `${Estado.conquistas.length}/${CONQUISTAS.length}`;
  },
};

/* =========================================================
   Sons — gerados com Web Audio API (sem arquivos externos).
   Música e efeitos começam DESLIGADOS.
   ========================================================= */
const Som = {
  ctx: null,
  saida: null,
  efeitos: false,
  musica: false,
  timer: null,
  passo: 0,
  proximaNota: 0,
  chuva: null,
  climaAtual: "chuva",

  garantir() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.saida = this.ctx.createGain();
      this.saida.gain.value = 0.6;
      this.saida.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },

  freq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  },

  // Toca uma nota simples com envelope (ataque e decaimento)
  nota(frequencia, inicio, duracao, tipo = "square", volume = 0.08, destino = null) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(frequencia, inicio);
    ganho.gain.setValueAtTime(0.0001, inicio);
    ganho.gain.exponentialRampToValueAtTime(volume, inicio + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    osc.connect(ganho);
    ganho.connect(destino || this.saida);
    osc.start(inicio);
    osc.stop(inicio + duracao + 0.05);
    return osc;
  },

  tocar(nome) {
    if (!this.efeitos || !this.garantir()) return;
    const t = this.ctx.currentTime;
    switch (nome) {
      case "clique":
        this.nota(660, t, 0.05, "square", 0.03);
        break;
      case "tecla":
        this.nota(900 + Math.random() * 200, t, 0.03, "square", 0.015);
        break;
      case "virar":
        this.nota(440, t, 0.08, "triangle", 0.06);
        this.nota(660, t + 0.06, 0.1, "triangle", 0.06);
        break;
      case "certo":
        [72, 76, 79, 84].forEach((m, i) => this.nota(this.freq(m), t + i * 0.08, 0.16, "square", 0.05));
        break;
      case "erro":
        this.nota(this.freq(52), t, 0.18, "sawtooth", 0.05);
        this.nota(this.freq(47), t + 0.15, 0.28, "sawtooth", 0.05);
        break;
      case "conquista":
        [67, 72, 76, 79, 84, 88].forEach((m, i) => this.nota(this.freq(m), t + i * 0.07, 0.2, "square", 0.045));
        break;
      case "cafe":
        this.nota(300, t, 0.12, "sine", 0.06);
        this.nota(220, t + 0.12, 0.2, "sine", 0.05);
        break;
      case "miau": {
        const osc = this.ctx.createOscillator();
        const ganho = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.12);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.4);
        ganho.gain.setValueAtTime(0.0001, t);
        ganho.gain.exponentialRampToValueAtTime(0.07, t + 0.05);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(ganho);
        ganho.connect(this.saida);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }
      default:
        break;
    }
  },

  alternarEfeitos() {
    this.efeitos = !this.efeitos;
    if (this.efeitos) {
      this.garantir();
      this.tocar("clique");
    }
    return this.efeitos;
  },

  /* ---- Música ambiente lo-fi gerada em tempo real ---- */
  alternarMusica() {
    this.musica = !this.musica;
    if (this.musica) {
      if (!this.garantir()) {
        this.musica = false;
        return false;
      }
      this.filtro = this.ctx.createBiquadFilter();
      this.filtro.type = "lowpass";
      this.filtro.frequency.value = 1600;
      this.ganhoMusica = this.ctx.createGain();
      this.ganhoMusica.gain.value = 0.9;
      this.filtro.connect(this.ganhoMusica);
      this.ganhoMusica.connect(this.saida);
      this.passo = 0;
      this.proximaNota = this.ctx.currentTime + 0.1;
      this.timer = setInterval(() => this.agendar(), 100);
      this.atualizarChuva();
    } else {
      clearInterval(this.timer);
      this.timer = null;
      if (this.ganhoMusica) {
        const g = this.ganhoMusica;
        g.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
        setTimeout(() => g.disconnect(), 800);
      }
      this.pararChuva();
    }
    return this.musica;
  },

  agendar() {
    // Am7 - Fmaj7 - Cmaj7 - G6, oito colcheias por acorde
    const acordes = [
      { baixo: 45, notas: [57, 60, 64, 67] },
      { baixo: 41, notas: [53, 57, 60, 64] },
      { baixo: 48, notas: [55, 59, 60, 64] },
      { baixo: 43, notas: [55, 59, 62, 64] },
    ];
    const padrao = [0, 2, 1, 3, 2, -1, 1, 2];
    const colcheia = 60 / 72 / 2;

    while (this.proximaNota < this.ctx.currentTime + 0.3) {
      const t = this.proximaNota;
      const acorde = acordes[Math.floor(this.passo / 8) % acordes.length];
      const p = this.passo % 8;

      if (p === 0) {
        acorde.notas.forEach((m) => this.nota(this.freq(m), t, colcheia * 8, "sine", 0.018, this.filtro));
        this.nota(this.freq(acorde.baixo), t, colcheia * 3, "sine", 0.07, this.filtro);
      }
      if (p === 4) this.nota(this.freq(acorde.baixo), t, colcheia * 3, "sine", 0.05, this.filtro);

      const i = padrao[p];
      if (i >= 0 && Math.random() > 0.15) {
        this.nota(this.freq(acorde.notas[i] + 12), t, colcheia * 1.6, "triangle", 0.03, this.filtro);
      }

      this.proximaNota += colcheia * (p % 2 === 0 ? 1.08 : 0.92); // leve "swing"
      this.passo++;
    }
  },

  definirClima(clima) {
    this.climaAtual = clima;
    this.atualizarChuva();
  },

  atualizarChuva() {
    if (this.musica && this.climaAtual === "chuva") this.iniciarChuva();
    else this.pararChuva();
  },

  iniciarChuva() {
    if (this.chuva || !this.ctx) return;
    const tamanho = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, tamanho, this.ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < tamanho; i++) dados[i] = Math.random() * 2 - 1;
    const fonte = this.ctx.createBufferSource();
    fonte.buffer = buffer;
    fonte.loop = true;
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 900;
    const ganho = this.ctx.createGain();
    ganho.gain.value = 0.0001;
    ganho.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.5);
    fonte.connect(filtro);
    filtro.connect(ganho);
    ganho.connect(this.saida);
    fonte.start();
    this.chuva = { fonte, ganho };
  },

  pararChuva() {
    if (!this.chuva) return;
    const { fonte, ganho } = this.chuva;
    ganho.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    setTimeout(() => fonte.stop(), 1200);
    this.chuva = null;
  },
};
