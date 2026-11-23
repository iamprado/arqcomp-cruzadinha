/* =========================================================
   DESKTOP PIXEL — script.js
   Cena em pixel art (canvas), aplicativo de flashcards,
   troca de aplicativos, barra de atalhos e tela inicial.
   ========================================================= */
"use strict";

/* =========================================================
   CENA — quarto aconchegante desenhado em pixel art
   (canvas de 192x144 pixels ampliado sem suavização)
   ========================================================= */
const Cena = (() => {
  const W = 192;
  const H = 144;
  const canvas = document.getElementById("cena");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const bolhaPersonagem = document.getElementById("bolha-personagem");
  const bolhaGato = document.getElementById("bolha-gato");

  const COR = {
    parede: "#1b2040", parede2: "#1f2549", chao: "#151a33", chao2: "#1b2140",
    moldura: "#3d3366", moldura2: "#54478a", cortina: "#5b3f9e", cortina2: "#7a57c9",
    mesa: "#8a624c", mesa2: "#6b4a3a", mesa3: "#4a3229",
    pele: "#f2c6a0", pele2: "#d9a07e", cabelo: "#2e1f4a", cabelo2: "#4a3175",
    moletom: "#9B6BFF", moletom2: "#6f4bd8", calca: "#2b3a67", tenis: "#e8e8f0",
    neon: "#25D9F2", gato: "#9aa0c0", gato2: "#6e7396", rosa: "#ff9db0",
    verde: "#52E58B", amarelo: "#ffd166", escuro: "#101426",
  };

  let quadro = 0;
  let ultimo = 0;
  let pose = "idle";
  let poseAte = 0;
  let digitandoAte = 0;
  let piscarAte = 0;
  let proximoPiscar = performance.now() + 3000;
  let proximoCafe = performance.now() + 45000;
  let gatoAcordadoAte = 0;
  let clima = "chuva";
  let app = "cruzadinha";
  let cartaoVirado = false;
  let timerBolha = null;
  let timerBolhaGato = null;

  // Partículas da janela (área do vidro: x 11..56, y 13..54)
  const gotas = Array.from({ length: 34 }, () => ({
    x: 11 + Math.random() * 50, y: 13 + Math.random() * 42, v: 2 + Math.random() * 2,
  }));
  const estrelas = Array.from({ length: 16 }, (_, i) => ({
    x: 12 + ((i * 37) % 44), y: 14 + ((i * 23) % 26), fase: i % 5,
  }));
  const predios = [
    [11, 44, 6], [17, 40, 5], [22, 46, 7], [29, 38, 5], [34, 43, 6], [40, 41, 7], [47, 45, 5], [52, 39, 5],
  ];

  function px(x, y, w, h, cor) {
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, w, h);
  }

  function alpha(a, fn) {
    ctx.globalAlpha = a;
    fn();
    ctx.globalAlpha = 1;
  }

  /* ---------- Fundo: parede, chão, luzinhas, pôster, prateleira ---------- */
  function desenharQuarto() {
    px(0, 0, W, H, COR.parede);
    for (let x = 0; x < W; x += 8) px(x, 0, 1, 124, COR.parede2);
    px(0, 120, W, 4, "#262c52"); // rodapé
    px(0, 124, W, 20, COR.chao);
    for (let y = 128; y < H; y += 5) px(0, y, W, 1, COR.chao2);

    // Tapete
    px(92, 128, 76, 8, "#2b2350");
    for (let x = 94; x < 166; x += 6) px(x, 131, 3, 2, "#3d3170");

    // Varal de luzinhas
    const coresLuz = [COR.neon, COR.moletom, COR.amarelo, COR.rosa, COR.verde];
    for (let x = 68; x < 190; x++) {
      const y = 5 + Math.round(Math.sin((x - 68) / 9) * 1.5);
      px(x, y, 1, 1, "#3a4168");
      if ((x - 68) % 10 === 5) {
        const i = Math.floor((x - 68) / 10);
        const ligada = (quadro + i) % 6 !== 0;
        px(x - 1, y + 1, 3, 3, ligada ? coresLuz[i % coresLuz.length] : "#3a4168");
        if (ligada) alpha(0.18, () => px(x - 3, y - 1, 7, 7, coresLuz[i % coresLuz.length]));
      }
    }

    // Pôster de um chip na parede
    px(94, 14, 26, 26, "#2a2f4f");
    px(96, 16, 22, 22, "#202D48");
    px(101, 21, 12, 12, COR.neon);
    px(103, 23, 8, 8, COR.escuro);
    px(105, 25, 4, 4, quadro % 8 < 4 ? COR.moletom : "#6f4bd8");
    for (let i = 0; i < 4; i++) {
      px(102 + i * 3, 18, 1, 3, COR.neon);
      px(102 + i * 3, 33, 1, 3, COR.neon);
      px(98, 22 + i * 3, 3, 1, COR.neon);
      px(113, 22 + i * 3, 3, 1, COR.neon);
    }

    // Prateleira com livros e um cactinho
    px(134, 36, 54, 3, "#5a3e31");
    px(138, 39, 2, 4, "#4a3229");
    px(182, 39, 2, 4, "#4a3229");
    const livros = [
      [137, 4, 11, "#FF5C72"], [141, 3, 9, COR.neon], [144, 4, 12, COR.moletom],
      [148, 3, 10, COR.verde], [151, 4, 11, COR.amarelo], [155, 3, 8, "#ff8fa3"],
    ];
    livros.forEach(([x, w, h, cor]) => {
      px(x, 36 - h, w, h, cor);
      px(x, 36 - h + 2, w, 1, "rgba(0,0,0,0.25)");
    });
    px(159, 28, 9, 8, "#c9a26b"); // livro deitado
    px(159, 30, 9, 1, "#a07a48");
    px(173, 30, 8, 6, "#b86b4b");
    px(175, 24, 2, 6, "#3fbf7f");
    px(178, 26, 2, 4, "#3fbf7f");
    px(176, 22, 1, 2, "#ff9db0");
  }

  /* ---------- Janela com chuva ou noite estrelada ---------- */
  function desenharJanela() {
    px(2, 7, 64, 2, COR.moldura);
    px(8, 10, 52, 48, COR.moldura);

    const ceu = clima === "chuva" ? ["#16213d", "#1b2a4a", "#22365c"] : ["#0b0d2a", "#141a45", "#23205a"];
    px(11, 13, 46, 14, ceu[0]);
    px(11, 27, 46, 14, ceu[1]);
    px(11, 41, 46, 14, ceu[2]);

    ctx.save();
    ctx.beginPath();
    ctx.rect(11, 13, 46, 42);
    ctx.clip();

    if (clima === "estrelas") {
      // Lua
      px(43, 16, 6, 7, "#f4f1c9");
      px(42, 17, 8, 5, "#f4f1c9");
      px(45, 17, 2, 2, "#d9d4a3");
      alpha(0.15, () => px(39, 13, 14, 13, "#f4f1c9"));
      estrelas.forEach((e) => {
        const brilho = (quadro + e.fase) % 10 < 7;
        px(e.x, e.y, 1, 1, brilho ? "#ffffff" : "#6a74b0");
        if (brilho && e.fase === 0) {
          px(e.x - 1, e.y, 3, 1, "#9ee8ff");
          px(e.x, e.y - 1, 1, 3, "#9ee8ff");
        }
      });
    } else {
      // Nuvens
      px(12, 14, 20, 4, "#2a3657");
      px(16, 12, 10, 3, "#2a3657");
      px(36, 17, 18, 4, "#2a3657");
      px(40, 15, 9, 3, "#2a3657");
    }

    // Cidade ao longe com janelas acesas
    predios.forEach(([x, y, w], i) => {
      px(x, y, w, 56 - y, "#0e1230");
      for (let wy = y + 2; wy < 54; wy += 3) {
        for (let wx = x + 1; wx < x + w - 1; wx += 2) {
          if ((wx * 7 + wy * 3 + i) % 5 === 0) px(wx, wy, 1, 1, (wx + wy) % 3 ? "#ffd27a" : COR.neon);
        }
      }
    });

    if (clima === "chuva") {
      gotas.forEach((g) => {
        alpha(0.7, () => {
          px(Math.round(g.x), Math.round(g.y), 1, 3, "#9fc6ff");
        });
      });
      // gotinhas paradas no vidro
      [[15, 20], [26, 31], [48, 24], [38, 47], [20, 44]].forEach(([x, y]) => px(x, y, 1, 2, "#7aa2e0"));
    }
    ctx.restore();

    // Divisórias e parapeito
    px(33, 13, 2, 42, COR.moldura);
    px(11, 33, 46, 2, COR.moldura);
    px(6, 56, 56, 3, COR.moldura2);

    // Cortinas
    px(3, 9, 7, 50, COR.cortina);
    px(58, 9, 7, 50, COR.cortina);
    for (let y = 10; y < 58; y += 1) {
      if (y % 4 === 0) {
        px(5, y, 1, 3, COR.cortina2);
        px(61, y, 1, 3, COR.cortina2);
      }
    }
    px(3, 30, 7, 2, COR.amarelo); // prendedor
    px(58, 30, 7, 2, COR.amarelo);
  }

  /* ---------- Mesa, luminária, caneca, monitor, teclado, planta ---------- */
  function desenharMesa() {
    // Pernas e gaveteiro
    px(36, 92, 4, 32, COR.mesa3);
    px(176, 92, 4, 32, COR.mesa3);
    px(40, 92, 28, 26, "#5b3d30");
    px(42, 100, 24, 1, COR.mesa3);
    px(42, 109, 24, 1, COR.mesa3);
    px(52, 95, 4, 1, "#c9a26b");
    px(52, 104, 4, 1, "#c9a26b");
    px(52, 113, 4, 1, "#c9a26b");
    // Tampo
    px(34, 86, 148, 3, COR.mesa);
    px(34, 89, 148, 3, COR.mesa2);

    // Planta no chão
    const balanco = Math.round(Math.sin(quadro / 6));
    px(176, 108, 16, 3, "#a05a3e");
    px(178, 111, 12, 13, "#b86b4b");
    px(178, 114, 12, 1, "#a05a3e");
    px(183 + balanco, 92, 2, 16, "#2e8f5f");
    px(179 + balanco, 96, 4, 3, "#3fbf7f");
    px(186 + balanco, 94, 4, 3, "#3fbf7f");
    px(177, 101, 5, 3, "#3fbf7f");
    px(186, 100, 5, 3, "#3fbf7f");
    px(182 + balanco, 89, 4, 3, "#52E58B");

    // Luminária e luz
    alpha(0.16, () => {
      ctx.fillStyle = "#ffd98a";
      ctx.beginPath();
      ctx.moveTo(49, 66);
      ctx.lineTo(57, 66);
      ctx.lineTo(66, 86);
      ctx.lineTo(38, 86);
      ctx.closePath();
      ctx.fill();
    });
    px(38, 84, 12, 2, "#6f4bd8");
    px(43, 68, 2, 16, "#6f4bd8");
    px(44, 66, 6, 2, "#6f4bd8");
    px(48, 61, 10, 5, COR.moletom);
    px(50, 59, 6, 2, COR.moletom);
    px(49, 61, 8, 1, "#b89aff");
    px(51, 66, 4, 1, "#fff2b3");
  }

  function desenharCaneca(naMesa) {
    if (!naMesa) return;
    px(54, 80, 5, 6, "#e8e8f0");
    px(54, 82, 5, 1, COR.neon);
    px(55, 80, 3, 1, "#5a3a2a");
    px(59, 81, 2, 1, "#e8e8f0");
    px(60, 82, 1, 2, "#e8e8f0");
    px(59, 84, 2, 1, "#e8e8f0");
    vapor(55, 77);
  }

  function vapor(x, y) {
    alpha(0.55, () => {
      const f = quadro % 6;
      px(x + (f < 3 ? 0 : 1), y - (f % 3), 1, 2, "#dfe6ff");
      px(x + 2 + (f < 3 ? 1 : 0), y - 1 - (f % 3), 1, 2, "#dfe6ff");
    });
  }

  function desenharMonitor() {
    // brilho da tela
    alpha(0.12, () => px(58, 52, 44, 36, COR.neon));
    px(62, 56, 36, 26, "#2a2f4f");
    px(64, 58, 32, 22, "#0f2f48");
    px(78, 82, 4, 3, "#2a2f4f");
    px(73, 85, 14, 1, "#3a4168");

    // Conteúdo da telinha muda conforme o app aberto
    px(64, 58, 32, 2, COR.moletom);
    if (app === "cruzadinha") {
      const cheio = Cruzadinha.preenchimento();
      let i = 0;
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 9; x++) {
          if ((x + y * 2) % 3 === 1) continue;
          const aceso = i / 30 < cheio;
          px(66 + x * 3, 62 + y * 3, 2, 2, aceso ? COR.verde : "#cfd8ff");
          i++;
        }
      }
    } else {
      px(70, 62, 20, 14, cartaoVirado ? "#173a52" : "#202D48");
      px(70, 62, 20, 1, cartaoVirado ? COR.neon : COR.moletom);
      px(73, 66, 14, 1, "#cfd8ff");
      px(73, 69, 10, 1, "#cfd8ff");
      px(73, 72, 12, 1, "#cfd8ff");
    }
    if (quadro % 4 < 2) px(91, 76, 2, 2, COR.neon); // cursor piscando

    // Teclado
    px(98, 84, 18, 2, "#3a4168");
    for (let x = 99; x < 115; x += 2) px(x, 84, 1, 1, "#5a628f");
    if (pose === "digitar" || performance.now() < digitandoAte) {
      px(99 + ((quadro * 5) % 8) * 2, 84, 1, 1, COR.neon);
    }
  }

  /* ---------- Cadeira e personagem ---------- */
  function desenharCadeira() {
    px(134, 68, 5, 27, "#3a2f5c");
    px(135, 69, 1, 24, "#4d3f7a");
    px(116, 94, 24, 3, "#3a2f5c");
    px(127, 97, 3, 17, "#2a2244");
    px(118, 114, 20, 2, "#2a2244");
    px(118, 116, 2, 2, "#15122a");
    px(127, 116, 2, 2, "#15122a");
    px(136, 116, 2, 2, "#15122a");
  }

  function desenharPersonagem(agora) {
    const comemorando = pose === "comemorar";
    const dy = comemorando && quadro % 4 < 2 ? -2 : 0;

    // Pernas (sempre iguais)
    px(108, 90, 22, 5, COR.calca);
    px(106, 90, 5, 24, COR.calca);
    px(102, 113, 9, 3, COR.tenis);
    px(102, 116, 9, 1, "#9aa0c0");

    // Tronco
    px(119, 74 + dy, 13, 17 - dy, COR.moletom);
    px(129, 74 + dy, 3, 17 - dy, COR.moletom2);
    px(126, 71 + dy, 7, 4, COR.moletom2);
    px(123, 71 + dy, 3, 3, COR.pele2);

    // Cabeça
    const hx = 119;
    const hy = 61 + dy;
    px(hx, hy, 10, 10, COR.pele);
    px(hx - 1, hy + 4, 1, 2, COR.pele); // nariz
    px(hx - 1, hy - 3, 12, 4, COR.cabelo);
    px(hx + 6, hy, 5, 9, COR.cabelo);
    px(hx - 1, hy + 1, 3, 2, COR.cabelo);
    px(hx + 2, hy - 3, 4, 1, COR.cabelo2);
    // Fone de ouvido
    px(hx + 3, hy - 4, 5, 1, COR.neon);
    px(hx + 6, hy + 2, 3, 5, COR.neon);
    px(hx + 7, hy + 3, 1, 3, "#1a8fa3");

    // Olho (pisca)
    const piscando = agora < piscarAte;
    if (piscando || comemorando) {
      px(hx + 1, hy + 4, 2, 1, "#1d1530");
    } else if (pose === "pensar") {
      px(hx + 2, hy + 2, 1, 2, "#1d1530");
    } else {
      px(hx + 2, hy + 3, 1, 2, "#1d1530");
    }
    px(hx + 3, hy + 6, 2, 1, "#f29a9a"); // bochecha

    // Boca
    if (comemorando) {
      px(hx, hy + 7, 3, 1, "#8a3b3b");
      px(hx + 1, hy + 8, 1, 1, "#8a3b3b");
    } else if (pose === "pensar") {
      px(hx, hy + 8, 2, 1, "#8a3b3b");
    } else if (pose !== "cafe") {
      px(hx, hy + 8, 2, 1, "#b5655a");
    }

    // Braços conforme a pose
    switch (pose) {
      case "comemorar": {
        px(116, 58 + dy, 3, 18, COR.moletom);
        px(131, 58 + dy, 3, 18, COR.moletom2);
        px(116, 55 + dy, 3, 3, COR.pele);
        px(131, 55 + dy, 3, 3, COR.pele);
        // brilhos
        const b = quadro % 3;
        [[110, 54], [138, 52], [124, 47], [143, 62]].forEach(([x, y], i) => {
          if ((i + b) % 2 === 0) {
            px(x, y - 1, 1, 3, COR.amarelo);
            px(x - 1, y, 3, 1, COR.amarelo);
          }
        });
        break;
      }
      case "pensar":
        px(120, 76, 4, 6, COR.moletom2);
        px(117, 70, 3, 12, COR.moletom);
        px(116, 68 + dy, 3, 3, COR.pele);
        break;
      case "cafe":
        px(120, 76, 4, 4, COR.moletom2);
        px(116, 69, 3, 11, COR.moletom);
        px(112, 66, 5, 6, "#e8e8f0");
        px(112, 68, 5, 1, COR.neon);
        px(117, 67, 1, 3, "#e8e8f0");
        px(116, 69, 2, 2, COR.pele);
        vapor(113, 63);
        break;
      case "acenar": {
        const lado = quadro % 2 === 0 ? 0 : -2;
        px(116, 62, 3, 14, COR.moletom);
        px(115 + lado, 58, 3, 4, COR.pele);
        px(121, 76, 4, 7, COR.moletom2);
        px(109, 82, 14, 3, COR.moletom2);
        px(105, 82, 4, 3, COR.pele);
        break;
      }
      default: {
        // idle e digitando: mãos no teclado
        const digitando = agora < digitandoAte || pose === "digitar";
        const bob = digitando ? quadro % 2 : 0;
        px(121, 76, 4, 7, COR.moletom2);
        px(109, 82, 14, 3, COR.moletom);
        px(105 - bob, 82 + bob, 4, 3, COR.pele);
        break;
      }
    }
  }

  /* ---------- Gatinho ---------- */
  function desenharGato(agora) {
    const acordado = agora < gatoAcordadoAte;
    const respira = quadro % 10 < 5 ? 0 : 1;

    if (!acordado) {
      px(150, 79 + respira, 15, 7 - respira, COR.gato);
      px(152, 78 + respira, 11, 1, COR.gato);
      px(155, 79 + respira, 1, 4, COR.gato2);
      px(159, 79 + respira, 1, 4, COR.gato2);
      px(162, 80 + respira, 1, 3, COR.gato2);
      px(164, 83, 6, 3, COR.gato);
      px(167, 81, 3, 2, COR.gato);
      px(167, 81, 1, 1, COR.gato2);
      // cabeça deitada
      px(144, 80, 8, 6, COR.gato);
      px(144, 78, 2, 2, COR.gato);
      px(149, 78, 2, 2, COR.gato);
      px(145, 79, 1, 1, COR.rosa);
      px(149, 79, 1, 1, COR.rosa);
      px(145, 83, 2, 1, "#3b3f5c");
      px(148, 83, 2, 1, "#3b3f5c");
      px(147, 84, 1, 1, COR.rosa);
      // zzz subindo
      const z = quadro % 18;
      if (z < 12) {
        const zx = 150 + Math.floor(z / 4);
        const zy = 74 - Math.floor(z / 2);
        alpha(1 - z / 14, () => {
          px(zx, zy, 3, 1, "#cfd8ff");
          px(zx + 1, zy + 1, 1, 1, "#cfd8ff");
          px(zx, zy + 2, 3, 1, "#cfd8ff");
        });
      }
    } else {
      const rabo = quadro % 4 < 2 ? 0 : 1;
      px(150, 78, 15, 8, COR.gato);
      px(155, 78, 1, 4, COR.gato2);
      px(159, 78, 1, 4, COR.gato2);
      px(165 + rabo, 70, 2, 10, COR.gato);
      px(164, 79, 3, 3, COR.gato);
      // cabeça levantada
      px(143, 73, 9, 8, COR.gato);
      px(143, 70, 2, 3, COR.gato);
      px(150, 70, 2, 3, COR.gato);
      px(143, 71, 1, 1, COR.rosa);
      px(151, 71, 1, 1, COR.rosa);
      px(145, 75, 1, 2, COR.verde);
      px(149, 75, 1, 2, COR.verde);
      px(147, 77, 1, 1, COR.rosa);
      px(146, 78, 1, 1, "#3b3f5c");
      px(148, 78, 1, 1, "#3b3f5c");
      px(141, 77, 2, 1, "#cfd8ff");
      px(152, 77, 2, 1, "#cfd8ff");
      // coraçõezinhos
      const h = quadro % 8;
      const cy = 66 - h;
      alpha(1 - h / 10, () => {
        px(155, cy, 2, 1, COR.rosa);
        px(158, cy, 2, 1, COR.rosa);
        px(155, cy + 1, 5, 1, COR.rosa);
        px(156, cy + 2, 3, 1, COR.rosa);
        px(157, cy + 3, 1, 1, COR.rosa);
      });
    }
  }

  /* ---------- Loop de animação (≈12 quadros por segundo) ---------- */
  function atualizar(agora) {
    if (clima === "chuva") {
      gotas.forEach((g) => {
        g.y += g.v;
        g.x -= 0.4;
        if (g.y > 56) {
          g.y = 10;
          g.x = 11 + Math.random() * 50;
        }
      });
    }
    if (pose !== "idle" && agora > poseAte) {
      pose = "idle";
      esconderBolha();
    }
    if (agora > proximoPiscar) {
      piscarAte = agora + 160;
      proximoPiscar = agora + 2500 + Math.random() * 3000;
    }
    // De vez em quando, toma um café sozinho
    if (agora > proximoCafe) {
      proximoCafe = agora + 45000 + Math.random() * 30000;
      if (pose === "idle" && agora > digitandoAte) definirPose("cafe", 2600);
    }
  }

  function desenhar(agora) {
    desenharQuarto();
    desenharJanela();
    desenharMesa();
    desenharCaneca(pose !== "cafe");
    desenharMonitor();
    desenharCadeira();
    desenharPersonagem(agora);
    desenharGato(agora);
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - ultimo < 83) return;
    ultimo = ts;
    quadro++;
    const agora = performance.now();
    atualizar(agora);
    desenhar(agora);
  }

  /* ---------- Balões de fala (HTML sobre o canvas) ---------- */
  function mostrarBolha(el, texto, x, y, ms, timerNome) {
    el.textContent = texto;
    el.style.left = `${(x / W) * 100}%`;
    el.style.top = `${(y / H) * 100}%`;
    el.hidden = false;
    // reinicia a animação
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
    if (timerNome === "gato") {
      clearTimeout(timerBolhaGato);
      timerBolhaGato = setTimeout(() => (el.hidden = true), ms);
    } else {
      clearTimeout(timerBolha);
      timerBolha = setTimeout(() => (el.hidden = true), ms);
    }
  }

  function falar(texto, ms = 2200) {
    mostrarBolha(bolhaPersonagem, texto, 124, 52, ms, "p");
  }

  function esconderBolha() {
    /* o balão some sozinho pelo timer */
  }

  function definirPose(nova, ms) {
    pose = nova;
    poseAte = performance.now() + ms;
  }

  /* ---------- API pública ---------- */
  const FALAS = {
    comemorar: ["Uhul!", "Acertei!", "Isso aí!", "Show!"],
    pensar: ["Hmm...", "?", "Será que...", "Deixa eu pensar"],
    cafe: ["Café time ☕", "Ahh, cafézinho", "Recarregando..."],
    acenar: ["Oi! Bora estudar?", "Você consegue!", "Dica: use os flashcards!", "Tab pula de palavra!", "Já fez carinho no gato?"],
  };

  function escolher(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function reagir(tipo) {
    const duracoes = { comemorar: 2200, pensar: 2200, cafe: 2600, acenar: 2000 };
    definirPose(tipo, duracoes[tipo] || 1500);
    if (FALAS[tipo]) falar(escolher(FALAS[tipo]), duracoes[tipo]);
  }

  function digitar() {
    digitandoAte = performance.now() + 900;
  }

  function acariciarGato() {
    gatoAcordadoAte = performance.now() + 3200;
    mostrarBolha(bolhaGato, escolher(["Miau!", "Purrr~", "Mrrp?", "Miau ♥"]), 150, 66, 2000, "gato");
    Som.tocar("miau");
    Jogo.desbloquear("gato");
  }

  function setClima(c) {
    clima = c;
  }

  function setApp(a) {
    app = a;
  }

  function setCartaoVirado(v) {
    cartaoVirado = v;
  }

  // Cliques no canvas: gatinho ou personagem
  function coordenadas(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  }

  function alvo(x, y) {
    if (x >= 140 && x <= 171 && y >= 66 && y <= 88) return "gato";
    if (x >= 100 && x <= 140 && y >= 54 && y <= 118) return "personagem";
    return null;
  }

  canvas.addEventListener("click", (e) => {
    const [x, y] = coordenadas(e);
    const a = alvo(x, y);
    if (a === "gato") acariciarGato();
    else if (a === "personagem") UI.interagir();
  });

  canvas.addEventListener("mousemove", (e) => {
    const [x, y] = coordenadas(e);
    canvas.style.cursor = alvo(x, y) ? "pointer" : "default";
  });

  requestAnimationFrame(loop);

  return { reagir, digitar, acariciarGato, setClima, setApp, setCartaoVirado, falar };
})();

/* =========================================================
   FLASHCARDS
   ========================================================= */
const Flashcards = (() => {
  const el = {};
  let virado = false;

  function cartaoAtual() {
    return TERMOS[Estado.flashcards.indice];
  }

  function render() {
    const t = cartaoAtual();
    const resultado = Estado.flashcards.resultados[t.id];

    el.pergunta.textContent = t.pergunta;
    el.resposta.textContent = t.titulo;
    el.explicacao.textContent = t.explicacao;
    el.pos.textContent = Estado.flashcards.indice + 1;
    el.total.textContent = TERMOS.length;

    el.selo.className = "fc-selo";
    el.selo.textContent = "";
    if (resultado === "ok") {
      el.selo.classList.add("ok");
      el.selo.textContent = "✓ acertou";
    } else if (resultado === "nao") {
      el.selo.classList.add("nao");
      el.selo.textContent = "✗ revisar";
    }

    const valores = Object.values(Estado.flashcards.resultados);
    el.acertos.textContent = valores.filter((v) => v === "ok").length;
    el.respondidos.textContent = valores.length;

    el.pontos.querySelectorAll(".fc-ponto").forEach((p, i) => {
      const r = Estado.flashcards.resultados[TERMOS[i].id];
      p.className = "fc-ponto";
      if (r) p.classList.add(r);
      if (i === Estado.flashcards.indice) p.classList.add("atual");
    });

    el.cartao.classList.toggle("virado", virado);
    el.nao.disabled = !virado;
    el.sim.disabled = !virado;
    Cena.setCartaoVirado(virado);
  }

  function virar() {
    virado = !virado;
    Som.tocar("virar");
    Cena.digitar();
    render();
  }

  function irPara(indice) {
    Estado.flashcards.indice = (indice + TERMOS.length) % TERMOS.length;
    virado = false;
    Jogo.salvar();
    // Troca de cartão sem animação, para não mostrar a resposta do próximo
    el.cartao.classList.add("sem-animacao");
    render();
    void el.cartao.offsetWidth;
    el.cartao.classList.remove("sem-animacao");
  }

  function responder(acertou) {
    if (!virado) return;
    const t = cartaoAtual();
    Estado.flashcards.resultados[t.id] = acertou ? "ok" : "nao";

    if (acertou) {
      Som.tocar("certo");
      Cena.reagir("comemorar");
      if (!Estado.flashcards.premiadas.includes(t.id)) {
        Estado.flashcards.premiadas.push(t.id);
        Jogo.ganharXP(XP_CARTAO, `flashcard ${t.titulo}`);
      }
      Jogo.mensagem(Jogo.incentivo());
    } else {
      Som.tocar("erro");
      Cena.reagir("pensar");
      Jogo.mensagem(`Sem problemas! Releia: ${t.titulo}. Ele volta no fim do baralho.`);
    }
    Jogo.salvar();
    Jogo.verificarConquistas();

    const respondidos = Object.keys(Estado.flashcards.resultados).length;
    if (respondidos === TERMOS.length && acertou) {
      const acertos = Object.values(Estado.flashcards.resultados).filter((v) => v === "ok").length;
      Jogo.toast(`Baralho concluído: ${acertos} de ${TERMOS.length} acertos`, "certo");
    }

    // Avança para o próximo cartão ainda não acertado (se houver)
    setTimeout(() => {
      const n = TERMOS.length;
      for (let passo = 1; passo <= n; passo++) {
        const i = (Estado.flashcards.indice + passo) % n;
        if (Estado.flashcards.resultados[TERMOS[i].id] !== "ok") {
          irPara(i);
          return;
        }
      }
      irPara(Estado.flashcards.indice + 1);
    }, 450);
  }

  function recomecar() {
    Estado.flashcards.resultados = {};
    irPara(0);
    Jogo.mensagem("Baralho recomeçado do primeiro cartão. O XP já ganho continua salvo.");
  }

  function teclado(e) {
    if (e.target.closest("input, textarea")) return;
    if (e.key === " " || e.key === "Enter") {
      if (e.target === el.cartao || !e.target.closest("button")) {
        e.preventDefault();
        virar();
      }
    } else if (e.key === "ArrowRight") {
      irPara(Estado.flashcards.indice + 1);
    } else if (e.key === "ArrowLeft") {
      irPara(Estado.flashcards.indice - 1);
    } else if (e.key === "1") {
      responder(false);
    } else if (e.key === "2") {
      responder(true);
    }
  }

  function init() {
    ["cartao", "pergunta", "resposta", "explicacao", "pos", "total", "acertos", "respondidos", "pontos", "selo", "nao", "sim"]
      .forEach((id) => (el[id] = document.getElementById(`fc-${id}`)));

    TERMOS.forEach((t, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "fc-ponto";
      b.title = `Cartão ${i + 1}`;
      b.setAttribute("aria-label", `Ir para o cartão ${i + 1}`);
      b.addEventListener("click", () => irPara(i));
      el.pontos.appendChild(b);
    });

    el.cartao.addEventListener("click", virar);
    el.nao.addEventListener("click", () => responder(false));
    el.sim.addEventListener("click", () => responder(true));
    document.getElementById("fc-ant").addEventListener("click", () => irPara(Estado.flashcards.indice - 1));
    document.getElementById("fc-prox").addEventListener("click", () => irPara(Estado.flashcards.indice + 1));
    document.getElementById("fc-recomecar").addEventListener("click", recomecar);
    render();
  }

  return { init, render, teclado, reset: () => irPara(Estado.flashcards.indice) };
})();

/* =========================================================
   INTERFACE — tela inicial, abas, dock, modal, relógio
   ========================================================= */
const UI = (() => {
  const abas = document.querySelectorAll(".app-aba");

  function abrirApp(nome) {
    Estado.app = nome;
    Jogo.salvar();
    abas.forEach((a) => a.classList.toggle("ativa", a.dataset.app === nome));
    document.getElementById("app-flashcards").hidden = nome !== "flashcards";
    document.getElementById("app-cruzadinha").hidden = nome !== "cruzadinha";
    Cena.setApp(nome);
  }

  function rotulo(id, icone, texto, pressionado) {
    const b = document.getElementById(id);
    b.innerHTML = `${icone} <span>${texto}</span>`;
    b.title = texto;
    b.setAttribute("aria-label", texto);
    if (pressionado !== undefined) b.setAttribute("aria-pressed", String(pressionado));
  }

  function aplicarClima() {
    Cena.setClima(Estado.clima);
    Som.definirClima(Estado.clima);
    if (Estado.clima === "chuva") rotulo("btn-clima", "☂", "Chuva");
    else rotulo("btn-clima", "✦", "Noite estrelada");
  }

  function interagir() {
    Cena.reagir("acenar");
    Som.tocar("clique");
  }

  /* ---------- Modal ---------- */
  const modal = document.getElementById("modal");

  function abrirModal(titulo, html, botoes) {
    document.getElementById("modal-titulo").textContent = titulo;
    document.getElementById("modal-corpo").innerHTML = html;
    const caixa = document.getElementById("modal-botoes");
    caixa.innerHTML = "";
    botoes.forEach(({ texto, classe, acao }) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn-pixel ${classe || ""}`;
      b.textContent = texto;
      b.addEventListener("click", () => {
        fecharModal();
        if (acao) acao();
      });
      caixa.appendChild(b);
    });
    modal.hidden = false;
    caixa.lastChild.focus();
  }

  function fecharModal() {
    modal.hidden = true;
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  function mostrarConquistas() {
    const itens = CONQUISTAS.map((c) => {
      const ok = Jogo.temConquista(c.id);
      return `<li class="${ok ? "ok" : ""}"><span class="ic">${ok ? c.icone : "?"}</span>
        <div><b>${c.nome}</b><span>${c.desc}</span></div></li>`;
    }).join("");
    abrirModal(`CONQUISTAS ${Estado.conquistas.length}/${CONQUISTAS.length}`,
      `<p>XP total: <b>${Estado.xp}</b></p><ul class="conquistas">${itens}</ul>`,
      [{ texto: "Fechar" }]);
  }

  function confirmarReset() {
    abrirModal("REINICIAR PARTIDA?",
      "<p>Isso apaga o XP, as conquistas, as respostas da cruzadinha e o progresso dos flashcards.</p>",
      [
        { texto: "Cancelar", classe: "secundario" },
        { texto: "Reiniciar tudo", classe: "erro", acao: reiniciarPartida },
      ]);
  }

  function reiniciarPartida() {
    const clima = Estado.clima;
    Jogo.apagarSave();
    Estado.clima = clima;
    Cruzadinha.reiniciar();
    Flashcards.reset();
    Jogo.atualizarHUD();
    abrirApp("cruzadinha");
    Jogo.salvar();
    Jogo.mensagem("Partida reiniciada. Um novo começo!");
    Jogo.toast("Partida reiniciada", "");
  }

  /* ---------- Relógio do monitor ---------- */
  function relogio() {
    const d = new Date();
    document.getElementById("relogio").textContent =
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  /* ---------- Tela inicial ---------- */
  function iniciar() {
    // O clique em START (ou o Enter) conta como interação do usuário,
    // então o navegador permite ligar a música e os efeitos aqui.
    if (!Som.musica) {
      const on = Som.alternarMusica();
      rotulo("btn-musica", "♪", `Música: ${on ? "ON" : "OFF"}`, on);
    }
    if (!Som.efeitos) {
      const on = Som.alternarEfeitos();
      rotulo("btn-sons", on ? "🔊" : "🔇", `Sons: ${on ? "ON" : "OFF"}`, on);
    }
    document.getElementById("inicio").hidden = true;
    document.getElementById("jogo").hidden = false;
    Jogo.mensagem(Estado.xp > 0
      ? `Bem-vindo de volta! Você tem ${Estado.xp} XP.`
      : "Clique no gatinho ou no personagem. Bons estudos!");
    setTimeout(() => Cena.falar("Bora estudar!", 2000), 400);
  }

  function prepararInicio() {
    const temSave = Jogo.existeSave() && (Estado.xp > 0 || Object.keys(Estado.cruzadinha.letras).length > 0
      || Object.keys(Estado.flashcards.resultados).length > 0);
    if (temSave) {
      const info = document.getElementById("inicio-save");
      info.hidden = false;
      info.textContent = `Progresso salvo: ${Estado.xp} XP · ${Jogo.totalAcertos()}/${Jogo.totalPossivel()} acertos`;
      document.getElementById("btn-start").textContent = "CONTINUAR";
      const novo = document.getElementById("btn-novo");
      novo.hidden = false;
      novo.addEventListener("click", () => {
        reiniciarPartida();
        iniciar();
      });
    }
    document.getElementById("btn-start").addEventListener("click", iniciar);
    document.getElementById("btn-start").focus();
  }

  function init() {
    abas.forEach((a) => a.addEventListener("click", () => {
      abrirApp(a.dataset.app);
      Som.tocar("clique");
    }));

    document.getElementById("btn-cafe").addEventListener("click", () => {
      Cena.reagir("cafe");
      Som.tocar("cafe");
      Estado.cafes++;
      Jogo.salvar();
      Jogo.verificarConquistas();
    });

    document.getElementById("btn-musica").addEventListener("click", () => {
      const on = Som.alternarMusica();
      rotulo("btn-musica", "♪", `Música: ${on ? "ON" : "OFF"}`, on);
      Jogo.mensagem(on ? "Música lo-fi ligada. Relaxa e estuda." : "Música desligada.");
    });

    document.getElementById("btn-clima").addEventListener("click", () => {
      Estado.clima = Estado.clima === "chuva" ? "estrelas" : "chuva";
      Jogo.salvar();
      aplicarClima();
      Som.tocar("clique");
    });

    document.getElementById("btn-interagir").addEventListener("click", interagir);

    document.getElementById("btn-sons").addEventListener("click", () => {
      const on = Som.alternarEfeitos();
      rotulo("btn-sons", on ? "🔊" : "🔇", `Sons: ${on ? "ON" : "OFF"}`, on);
    });

    document.getElementById("btn-reset").addEventListener("click", confirmarReset);
    document.getElementById("btn-conquistas").addEventListener("click", mostrarConquistas);

    document.addEventListener("keydown", (e) => {
      if (!document.getElementById("inicio").hidden) {
        if (e.key === "Enter" && e.target.tagName !== "BUTTON") iniciar();
        return;
      }
      if (!modal.hidden) {
        if (e.key === "Escape") fecharModal();
        return;
      }
      if (Estado.app === "flashcards") Flashcards.teclado(e);
    });

    // rótulos iniciais (para o modo compacto do celular)
    rotulo("btn-cafe", "☕", "Café");
    rotulo("btn-musica", "♪", "Música: OFF", false);
    rotulo("btn-interagir", "✋", "Interagir");
    rotulo("btn-sons", "🔇", "Sons: OFF", false);
    rotulo("btn-reset", "⟲", "Reiniciar partida");

    aplicarClima();
    abrirApp(Estado.app === "flashcards" ? "flashcards" : "cruzadinha");
    relogio();
    setInterval(relogio, 10000);
    Jogo.atualizarHUD();
    prepararInicio();
  }

  return { init, interagir, abrirApp };
})();

/* ---------- Inicialização ---------- */
Cruzadinha.init();
Flashcards.init();
UI.init();
