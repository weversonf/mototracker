# Direção visual — MotoPulse

## Especificação de referência

Esta é uma tarefa de reprodução visual. A referência fornecida pelo usuário (pin do Pinterest) é a fonte de verdade para a linguagem do produto: conjunto de telas mobile escuras em uma composição editorial, superfícies grafite quase pretas, tipografia clara e compacta, indicadores circulares, cartões de telemetria e um único acento laranja-avermelhado para ações, progresso e estados ativos. A adaptação troca o contexto de carro inteligente por um painel de motociclista: rota, ritmo, combustível, clima, paradas e telemetria da moto. O resultado deve preservar a sensação premium, técnica e tátil da referência sem copiar marca, textos ou ativos proprietários.

## Abordagem escolhida: Industrial Editorial Control Center

### Design Movement

Interface editorial de controle automotivo, combinando brutalismo refinado, UI de instrumentação e o rigor de um cockpit digital. A composição deve parecer uma prancha de produto premium, mas funcionar como um dashboard legível em uso real.

### Core Principles

1. **Dados como protagonista:** cada bloco tem uma função operacional clara e números com alto contraste.
2. **Assimetria controlada:** a estrutura parte de uma coluna principal de telemetria e uma coluna lateral de rota, evitando um dashboard perfeitamente centralizado.
3. **Escuro com calor pontual:** o fundo é grafite profundo; o laranja queimado sinaliza ação, progresso e alerta sem transformar a experiência em neon.
4. **Detalhe tátil:** bordas finas, ruído sutil, sombras internas e microanimações dão profundidade de hardware à interface.

### Color Philosophy

O preto azulado cria concentração e reduz distrações durante a pilotagem. O branco quente mantém leitura confortável em vez de usar branco absoluto. O laranja queimado funciona como a luz de um painel analógico: é raro, imediato e associado a movimento, não a decoração. Verdes suaves ficam reservados a estados seguros e confirmados.

### Layout Paradigm

No mobile, a tela inicial é uma prancha vertical de módulos: cabeçalho mínimo, herói de telemetria com velocímetro, faixa horizontal de métricas, mapa escuro com rota laranja e cards empilhados de viagem. Em larguras maiores, a composição abre em duas colunas assimétricas — telemetria e atividade na esquerda, navegação e paradas na direita — mantendo a densidade visual da referência.

### Signature Elements

- **Arco de leitura:** velocímetro circular com arco laranja e ponteiro discreto, inspirado em instrumentos de moto.
- **Linha de rota viva:** mapa abstrato em charcoal com uma rota de cor laranja e marcador circular pulsante.
- **Pílulas de hardware:** cards compactos com raio pequeno, borda de 1px e microcopy técnica em caixa alta.

### Interaction Philosophy

As interações devem lembrar comandos de uma moto conectada: tocar em um módulo revela detalhes sem trocar de contexto; o botão principal sempre indica a próxima ação de pilotagem; estados ativos têm feedback curto de escala e brilho interno. O menu inferior organiza quatro destinos persistentes: painel, rotas, garagem e perfil.

### Animation

As entradas usam uma subida curta com opacidade e deslocamento de poucos pixels, em cascata de 40–60 ms por módulo. O arco de telemetria preenche suavemente ao carregar. O marcador da rota pulsa apenas quando a viagem está ativa. Pressões usam escala de 0.97 por cerca de 160 ms. Tudo deve respeitar `prefers-reduced-motion`, mantendo apenas mudanças de estado essenciais.

### Typography System

Usar **Space Grotesk** para títulos, números e labels de navegação, com pesos 500–700 para a personalidade mecânica. Usar **DM Sans** para corpo e microcopy, com peso 400–500 para leitura contínua. Números de telemetria podem usar Space Grotesk com tracking negativo; labels técnicos usam caixa alta e tracking positivo.

### Brand Essence

**MotoPulse é o painel de viagem para quem transforma cada rota em ritmo, criado para motociclistas que querem leitura rápida, segurança e prazer de pilotar sem distração.** Personalidade: precisa, confiante, inquieta.

### Brand Voice

Headlines são curtas e visuais; CTAs usam verbos concretos; microcopy orienta sem soar burocrática. Evitar frases genéricas de onboarding.

Exemplos:

> **Seu ritmo. A estrada à frente.**

> **Retomar rota**

### Wordmark & Logo

O símbolo é um monograma abstrato formado por duas curvas que lembram uma curva de estrada e o giro de uma roda, encaixadas em um quadrado arredondado. O wordmark “MotoPulse” deve aparecer em Space Grotesk Semibold, com “Moto” em branco quente e “Pulse” em laranja queimado. O símbolo deve funcionar isolado em favicon e avatar.

### Signature Brand Color

**Pulse Orange — `#F0643C`**. Um laranja avermelhado, quente e proprietário, pensado para parecer o reflexo de um painel aceso no fim da tarde.
