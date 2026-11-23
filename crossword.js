/* =========================================================
   DESKTOP PIXEL — crossword.js
   Cruzadinha com os 16 termos, todos cruzados entre si.
   ========================================================= */
"use strict";

const Cruzadinha = (() => {
  const LINHAS = 14;
  const COLUNAS = 16;

  /* Posição de cada palavra no tabuleiro: [linha, coluna, direção]
     (linha e coluna começam em 0; H = horizontal, V = vertical)

     . . . . . . . . . . . . . R O M
     . R . A . . . . . . . . . . . E
     . E . D U A L C O R E . . R A M
     . G . D . . . . . . . U . . . O
     M I C R O C O N T R O L A D O R
     . S . E . P . . . . . A . M . I
     . T . S . U . . . . F . . A . A
     . R . S . . . . . . L . U . . D
     . A . B . . . . Q U A D C O R E
     . D . U . . . . . . S . . . . M
     . O . S . . . C A C H E . . . A
     . R . . . . . . . . . . . . . S
     . E E P R O M . . D A T A B U S
     . S . . . . . . . . . . . . . A          */
  const LAYOUT = {
    ROM: [0, 13, "H"],
    MEMORIADEMASSA: [0, 15, "V"],
    REGISTRADORES: [1, 1, "V"],
    ADDRESSBUS: [1, 3, "V"],
    DUALCORE: [2, 3, "H"],
    RAM: [2, 13, "H"],
    ULA: [3, 11, "V"],
    MICROCONTROLADOR: [4, 0, "H"],
    CPU: [4, 5, "V"],
    DMA: [4, 13, "V"],
    FLASH: [6, 10, "V"],
    UC: [7, 12, "V"],
    QUADCORE: [8, 8, "H"],
    CACHE: [10, 7, "H"],
    EEPROM: [12, 1, "H"],
    DATABUS: [12, 9, "H"],
  };

  const palavras = TERMOS.map((t) => {
    const [linha, coluna, direcao] = LAYOUT[t.id];
    return { id: t.id, resposta: t.id, pista: t.pista, linha, coluna, direcao };
  });

  const casas = []; // casas[l][c] = { letra, palavras, input, el }
  let palavraAtiva = null;
  let direcao = "H";

  let elTabuleiro, elH, elV, elPlacar, elPistaAtual;

  function posicoes(p) {
    const lista = [];
    for (let i = 0; i < p.resposta.length; i++) {
      lista.push(p.direcao === "H" ? [p.linha, p.coluna + i] : [p.linha + i, p.coluna]);
    }
    return lista;
  }

  function chave(l, c) {
    return `${l},${c}`;
  }

  /* ---------- Montagem ---------- */
  function montar() {
    for (let l = 0; l < LINHAS; l++) casas.push(new Array(COLUNAS).fill(null));

    palavras.forEach((p) => {
      posicoes(p).forEach(([l, c], i) => {
        const letra = p.resposta[i];
        if (!casas[l][c]) casas[l][c] = { letra, palavras: [] };
        else if (casas[l][c].letra !== letra) console.error(`Cruzamento inválido em ${l},${c} (${p.id})`);
        casas[l][c].palavras.push(p);
      });
    });

    // Numeração na ordem de leitura (esquerda → direita, cima → baixo)
    let n = 0;
    for (let l = 0; l < LINHAS; l++) {
      for (let c = 0; c < COLUNAS; c++) {
        const comecam = palavras.filter((p) => p.linha === l && p.coluna === c);
        if (comecam.length) {
          n++;
          comecam.forEach((p) => (p.numero = n));
        }
      }
    }

    const frag = document.createDocumentFragment();
    for (let l = 0; l < LINHAS; l++) {
      for (let c = 0; c < COLUNAS; c++) {
        const div = document.createElement("div");
        div.className = "cw-casa";
        const casa = casas[l][c];
        if (casa) {
          const inicio = casa.palavras.find((p) => p.linha === l && p.coluna === c);
          if (inicio) {
            const num = document.createElement("span");
            num.className = "cw-num";
            num.textContent = inicio.numero;
            div.appendChild(num);
          }
          const input = document.createElement("input");
          input.type = "text";
          input.maxLength = 2;
          input.autocomplete = "off";
          input.spellcheck = false;
          input.setAttribute("autocapitalize", "characters");
          input.setAttribute("autocorrect", "off");
          input.setAttribute("aria-label", `Linha ${l + 1}, coluna ${c + 1}`);
          input.addEventListener("pointerdown", (e) => aoClicar(e, l, c));
          input.addEventListener("focus", () => aoFocar(l, c));
          input.addEventListener("keydown", (e) => aoTeclar(e, l, c));
          input.addEventListener("input", () => aoDigitar(l, c));
          div.appendChild(input);
          casa.input = input;
          casa.el = div;
        }
        frag.appendChild(div);
      }
    }
    elTabuleiro.appendChild(frag);

    // Lista de pistas
    [...palavras].sort((a, b) => a.numero - b.numero).forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="n">${p.numero}.</span>${p.pista} <small>(${p.resposta.length})</small>`;
      li.addEventListener("click", () => {
        selecionar(p);
        focarCasa(...primeiraVazia(p));
      });
      p.li = li;
      (p.direcao === "H" ? elH : elV).appendChild(li);
    });
  }

  /* ---------- Seleção ---------- */
  function selecionar(p) {
    palavraAtiva = p;
    direcao = p.direcao;
    destacar();
  }

  function destacar() {
    elTabuleiro.querySelectorAll(".na-palavra").forEach((el) => el.classList.remove("na-palavra"));
    document.querySelectorAll(".cw-lista li.ativa").forEach((el) => el.classList.remove("ativa"));
    if (!palavraAtiva) {
      elPistaAtual.textContent = "Clique numa casa para começar.";
      return;
    }
    posicoes(palavraAtiva).forEach(([l, c]) => casas[l][c].el.classList.add("na-palavra"));
    palavraAtiva.li.classList.add("ativa");
    const nome = palavraAtiva.direcao === "H" ? "HORIZONTAL" : "VERTICAL";
    elPistaAtual.innerHTML = `<b>${palavraAtiva.numero} ${nome}</b>${palavraAtiva.pista} <small>(${palavraAtiva.resposta.length} letras)</small>`;
  }

  function primeiraVazia(p) {
    const pos = posicoes(p);
    return pos.find(([l, c]) => !casas[l][c].input.value) || pos[0];
  }

  function focarCasa(l, c) {
    if (l < 0 || l >= LINHAS || c < 0 || c >= COLUNAS || !casas[l][c]) return false;
    casas[l][c].input.focus({ preventScroll: true });
    return true;
  }

  function aoClicar(e, l, c) {
    // Clicar de novo na casa já ativa troca a direção (quando há cruzamento)
    if (document.activeElement === casas[l][c].input) trocarDirecao(l, c);
  }

  function trocarDirecao(l, c) {
    const outra = casas[l][c].palavras.find((p) => p !== palavraAtiva);
    if (outra) selecionar(outra);
  }

  function aoFocar(l, c) {
    elTabuleiro.querySelectorAll(".ativa").forEach((el) => el.classList.remove("ativa"));
    casas[l][c].el.classList.add("ativa");
    const daCasa = casas[l][c].palavras;
    if (!palavraAtiva || !daCasa.includes(palavraAtiva)) {
      selecionar(daCasa.find((p) => p.direcao === direcao) || daCasa[0]);
    }
  }

  function avancar(l, c, passo) {
    const [dl, dc] = direcao === "H" ? [0, passo] : [passo, 0];
    const nl = l + dl;
    const nc = c + dc;
    // Só avança se a próxima casa pertence à palavra ativa
    if (casas[nl] && casas[nl][nc] && casas[nl][nc].palavras.includes(palavraAtiva)) {
      focarCasa(nl, nc);
      return true;
    }
    return false;
  }

  /* ---------- Digitação ---------- */
  function escrever(l, c, letra) {
    casas[l][c].input.value = letra;
    if (letra) Estado.cruzadinha.letras[chave(l, c)] = letra;
    else delete Estado.cruzadinha.letras[chave(l, c)];
    if (Estado.cruzadinha.conferido) {
      Estado.cruzadinha.conferido = false;
      limparMarcas();
    }
    Jogo.salvar();
  }

  function limparLetra(texto) {
    return texto.normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase();
  }

  // Usado principalmente pelo teclado virtual do celular
  function aoDigitar(l, c) {
    const input = casas[l][c].input;
    const letra = limparLetra(input.value).slice(-1);
    escrever(l, c, letra);
    if (letra) {
      Som.tocar("tecla");
      Cena.digitar();
      avancar(l, c, 1);
    }
  }

  function aoTeclar(e, l, c) {
    const input = casas[l][c].input;
    const k = e.key;

    if (k === "Backspace") {
      e.preventDefault();
      if (input.value) {
        escrever(l, c, "");
      } else {
        const [dl, dc] = direcao === "H" ? [0, -1] : [-1, 0];
        if (avancar(l, c, -1)) escrever(l + dl, c + dc, "");
      }
    } else if (k === "Delete") {
      e.preventDefault();
      escrever(l, c, "");
    } else if (k.startsWith("Arrow")) {
      e.preventDefault();
      mover(k, l, c);
    } else if (k === " ") {
      e.preventDefault();
      trocarDirecao(l, c);
    } else if (k === "Tab") {
      e.preventDefault();
      pularPalavra(e.shiftKey ? -1 : 1);
    } else if (k === "Enter") {
      e.preventDefault();
      conferir();
    } else if (k === "Home" || k === "End") {
      e.preventDefault();
      const pos = posicoes(palavraAtiva);
      focarCasa(...(k === "Home" ? pos[0] : pos[pos.length - 1]));
    } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const letra = limparLetra(k);
      if (letra) {
        escrever(l, c, letra);
        Som.tocar("tecla");
        Cena.digitar();
        avancar(l, c, 1);
      }
    }
  }

  function mover(tecla, l, c) {
    const horizontal = tecla === "ArrowLeft" || tecla === "ArrowRight";
    const passo = tecla === "ArrowRight" || tecla === "ArrowDown" ? 1 : -1;
    const novaDirecao = horizontal ? "H" : "V";

    // Primeira seta na outra direção só troca a palavra, se houver cruzamento
    if (direcao !== novaDirecao) {
      const outra = casas[l][c].palavras.find((p) => p.direcao === novaDirecao);
      if (outra) {
        selecionar(outra);
        return;
      }
    }
    let nl = l;
    let nc = c;
    do {
      if (horizontal) nc += passo;
      else nl += passo;
    } while (nl >= 0 && nl < LINHAS && nc >= 0 && nc < COLUNAS && !casas[nl][nc]);

    if (nl >= 0 && nl < LINHAS && nc >= 0 && nc < COLUNAS) {
      const destino = casas[nl][nc];
      const p = destino.palavras.find((x) => x.direcao === novaDirecao) || destino.palavras[0];
      palavraAtiva = p;
      direcao = p.direcao;
      focarCasa(nl, nc);
      destacar();
    }
  }

  function pularPalavra(passo) {
    const ordem = [...palavras].sort((a, b) =>
      a.direcao === b.direcao ? a.numero - b.numero : a.direcao === "H" ? -1 : 1);
    const i = palavraAtiva ? ordem.indexOf(palavraAtiva) : -1;
    const proxima = ordem[(i + passo + ordem.length) % ordem.length];
    selecionar(proxima);
    focarCasa(...primeiraVazia(proxima));
  }

  /* ---------- Conferir ---------- */
  function digitada(p) {
    return posicoes(p).map(([l, c]) => casas[l][c].input.value || " ").join("");
  }

  function limparMarcas() {
    elTabuleiro.querySelectorAll(".certa, .errada").forEach((el) => el.classList.remove("certa", "errada"));
    document.querySelectorAll(".cw-lista li").forEach((li) => li.classList.remove("certa", "errada", "vazia", "incompleta"));
  }

  function conferir(silencioso = false) {
    limparMarcas();
    let acertos = 0;
    let erradas = 0;
    const novas = [];
    const certas = [];

    palavras.forEach((p) => {
      const texto = digitada(p);
      if (texto === p.resposta) {
        acertos++;
        certas.push(p);
        p.li.classList.add("certa");
        if (!Estado.cruzadinha.premiadas.includes(p.id)) {
          Estado.cruzadinha.premiadas.push(p.id);
          novas.push(p);
        }
      } else if (texto.includes(" ")) {
        // palavra incompleta: não conta como acerto, mas também não pinta de vermelho
        p.li.classList.add(texto.trim() === "" ? "vazia" : "incompleta");
      } else {
        erradas++;
        p.li.classList.add("errada");
        posicoes(p).forEach(([l, c]) => casas[l][c].el.classList.add("errada"));
      }
    });

    // Casas de palavras certas ficam verdes (mesmo cruzando uma errada)
    certas.forEach((p) => posicoes(p).forEach(([l, c]) => {
      casas[l][c].el.classList.remove("errada");
      casas[l][c].el.classList.add("certa");
    }));

    elPlacar.textContent = `${acertos} de ${palavras.length} palavras`;
    Estado.cruzadinha.conferido = true;
    Jogo.salvar();

    if (silencioso) return;

    if (novas.length) {
      Jogo.ganharXP(novas.length * XP_PALAVRA, `${novas.length} palavra(s) nova(s)`);
      Som.tocar("certo");
      Cena.reagir("comemorar");
      Jogo.mensagem(Jogo.incentivo());
    } else if (erradas) {
      Som.tocar("erro");
      Cena.reagir("pensar");
      Jogo.mensagem(Jogo.consolo());
    } else if (acertos === 0) {
      Jogo.mensagem("O tabuleiro está vazio. Escolha uma pista e comece!");
    } else {
      Jogo.mensagem(`${acertos} palavra(s) certa(s). Continue preenchendo!`);
    }

    if (erradas) Jogo.toast(`${erradas} palavra(s) com erro`, "erro");
    if (acertos === palavras.length) {
      Jogo.toast("⚡ SISTEMA RESTAURADO! Cruzadinha completa!", "certo");
      Jogo.mensagem("Sistema restaurado! Você completou a cruzadinha inteira!");
    }
    Jogo.verificarConquistas();
  }

  /* ---------- Reiniciar ---------- */
  function reiniciar() {
    for (let l = 0; l < LINHAS; l++) {
      for (let c = 0; c < COLUNAS; c++) if (casas[l][c]) casas[l][c].input.value = "";
    }
    Estado.cruzadinha.letras = {};
    Estado.cruzadinha.conferido = false;
    Jogo.salvar();
    limparMarcas();
    palavraAtiva = null;
    direcao = "H";
    elTabuleiro.querySelectorAll(".ativa").forEach((el) => el.classList.remove("ativa"));
    destacar();
    elPlacar.textContent = `0 de ${palavras.length} palavras`;
  }

  /* ---------- Restaurar progresso salvo ---------- */
  function restaurar() {
    Object.entries(Estado.cruzadinha.letras).forEach(([k, letra]) => {
      const [l, c] = k.split(",").map(Number);
      if (casas[l] && casas[l][c]) casas[l][c].input.value = letra;
    });
    if (Estado.cruzadinha.conferido) conferir(true);
    else elPlacar.textContent = `0 de ${palavras.length} palavras`;
  }

  function init() {
    elTabuleiro = document.getElementById("cw-tabuleiro");
    elH = document.getElementById("cw-horizontais");
    elV = document.getElementById("cw-verticais");
    elPlacar = document.getElementById("cw-placar");
    elPistaAtual = document.getElementById("cw-pista-atual");
    montar();
    restaurar();
    document.getElementById("cw-conferir").addEventListener("click", () => conferir());
    document.getElementById("cw-reiniciar").addEventListener("click", () => {
      reiniciar();
      Som.tocar("clique");
      Jogo.mensagem("Tabuleiro limpo. O XP que você já ganhou continua salvo.");
    });
  }

  // Quantas casas estão preenchidas (usado no monitor da cena)
  function preenchimento() {
    let total = 0;
    let cheias = 0;
    casas.forEach((linha) => linha.forEach((casa) => {
      if (casa) {
        total++;
        if (casa.input.value) cheias++;
      }
    }));
    return total ? cheias / total : 0;
  }

  return { init, reiniciar, conferir, preenchimento, palavras, posicoes, LINHAS, COLUNAS };
})();
