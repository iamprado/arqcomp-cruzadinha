# DESKTOP PIXEL — Study & Play

Jogo educativo de **Arquitetura Computacional** com estética retrô em pixel art.
Num quartinho aconchegante à noite, um personagem estuda no computador ao lado de um gatinho dormindo.
O monitor tem dois aplicativos: **Flashcards**, para memorizar os conceitos, e **Cruzadinha**, para colocá-los à prova.

🔗 **Jogue aqui:** https://SEU-USUARIO.github.io/arqcomp-cruzadinha/

## Tecnologias

- HTML5, CSS3 e JavaScript puro (Vanilla JS), sem frameworks nem bibliotecas
- Canvas 2D para a cena em pixel art (desenhada por código, quadro a quadro)
- Web Audio API para a música lo-fi e os efeitos sonoros, gerados em tempo real
- `localStorage` para salvar o progresso
- Fontes **Press Start 2P** e **VT323** (Google Fonts)

## Como jogar

1. Na tela inicial, clique em **START** (ou aperte `Enter`).
2. No monitor, escolha o aplicativo pelas abas **FLASHCARDS** e **CRUZADINHA**. Dá para trocar a qualquer momento sem perder o progresso.

### Flashcards

- Leia a pergunta e clique no cartão (ou aperte `Espaço`) para virar e ver a resposta.
- Responda com sinceridade: **✗ Não sabia** ou **✓ Acertei**.
- Os quadradinhos no topo mostram o progresso do baralho (verde = acertou, vermelho = revisar).
- Atalhos: `←` `→` navegar · `Espaço` virar · `1` não sabia · `2` acertei.

### Cruzadinha

- Clique numa casa ou numa pista e digite. As respostas são em letras maiúsculas, sem acento e sem espaço (acentos digitados são removidos automaticamente).
- A palavra selecionada e a pista dela ficam destacadas.
- Clique de novo na mesma casa (ou aperte `Espaço`) para trocar entre horizontal e vertical.
- Teclado: setas para mover, `Tab` / `Shift+Tab` para pular de palavra, `Backspace` para apagar, `Enter` para conferir.
- **CONFERIR** pinta de verde as palavras certas e de vermelho as erradas, e mostra o placar, por exemplo "8 de 16 palavras".
- **REINICIAR** limpa o tabuleiro.

### Ambiente e recompensas

- Cada palavra nova certa na cruzadinha vale **100 XP**; cada flashcard acertado vale **50 XP** (uma vez por termo).
- O personagem digita enquanto você escreve, comemora quando você acerta, fica pensativo quando erra e de vez em quando toma um café.
- Clique no **gatinho** para acordá-lo e no **personagem** para ele falar com você.
- Barra inferior: ☕ café · ♪ música lo-fi · ☂/✦ chuva ou noite estrelada · ✋ interagir · 🔇 sons · ⟲ reiniciar a partida.
- Música e sons começam **desligados**.
- Conquistas: Primeiro acerto, Cinco respostas corretas, Mestre das memórias, Sistema restaurado, Memória fotográfica, Amigo felino e Movido a café.

## Palavras e pistas da cruzadinha

O tabuleiro usa as **16 palavras**, todas cruzadas entre si.

### Horizontais

| Nº | Palavra | Pista |
|----|---------|-------|
| 1 | ROM | Memória não volátil gravada na fábrica, que normalmente não pode ser alterada. |
| 5 | DUALCORE | Processador com duas unidades de processamento independentes no mesmo chip. |
| 6 | RAM | Memória principal e volátil onde ficam os programas em execução. |
| 8 | MICROCONTROLADOR | Chip que reúne processador, memória e periféricos, usado em sistemas embarcados. |
| 13 | QUADCORE | Processador com quatro unidades de processamento independentes no mesmo chip. |
| 14 | CACHE | Memória pequena e muito rápida que fica entre o processador e a principal. |
| 15 | EEPROM | Memória permanente regravável byte a byte, boa para guardar configurações pequenas. |
| 16 | DATABUS | Linhas por onde as informações trafegam entre processador, memória e periféricos. |

### Verticais

| Nº | Palavra | Pista |
|----|---------|-------|
| 2 | MEMORIADEMASSA | Onde os arquivos ficam guardados de forma permanente e em grande quantidade, como HD. |
| 3 | REGISTRADORES | Pequenas memórias dentro do processador, as mais rápidas, que guardam valores em uso. |
| 4 | ADDRESSBUS | Linhas que indicam qual posição da memória o processador quer acessar. |
| 7 | ULA | Parte do processador que realiza cálculos e comparações com os dados. |
| 9 | CPU | Cérebro do computador: busca, decodifica e executa as instruções dos programas. |
| 10 | DMA | Recurso que deixa periféricos moverem dados sem precisar passar pelo processador. |
| 11 | FLASH | Memória não volátil regravada em blocos, usada em pendrives e cartões de memória. |
| 12 | UC | Coordena o processador, interpretando instruções e enviando sinais às outras partes. |

## Estrutura do projeto

```
arqcomp-cruzadinha/
├── index.html      → página do jogo (tela inicial, quarto, monitor e barra de atalhos)
├── style.css       → visual pixel art e layout responsivo
├── game.js         → termos e pistas, XP, conquistas, salvamento e sons
├── crossword.js    → tabuleiro, digitação, teclado, CONFERIR e REINICIAR
├── script.js       → cena animada no canvas, flashcards e interface
├── README.md
└── assets/
    ├── images/     → ícone do site
    ├── sounds/     → (vazia: os sons são gerados pela Web Audio API)
    └── fonts/      → (vazia: as fontes vêm do Google Fonts)
```

## Executar localmente

Não precisa de instalação nem de servidor backend.

- **Jeito mais simples:** dê dois cliques no `index.html` para abrir no navegador.
- **Com servidor local (opcional):** na pasta do projeto, rode `python -m http.server 8000` e acesse `http://localhost:8000`.

## Publicar no GitHub Pages

1. Crie um repositório **público** chamado `arqcomp-cruzadinha` e envie os arquivos para a branch `main`, com o `index.html` na raiz.
2. No repositório, abra **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, selecione a branch **main** e a pasta **/ (root)** e clique em **Save**.
4. Depois de alguns minutos, o site fica no ar em `https://SEU-USUARIO.github.io/arqcomp-cruzadinha/`.
5. Teste o link numa janela anônima do navegador.
