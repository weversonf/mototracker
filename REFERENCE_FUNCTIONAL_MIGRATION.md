# Migração funcional — frontend de referência

## Restrição inegociável

O arquivo visual referenciado é a **fonte de verdade para layout, composição, tipografia, cores, espaçamentos, hierarquia e responsividade**. A migração deve alterar somente a origem dos dados e os comportamentos de controles que já existem no desenho, sem introduzir uma nova navegação ou reestruturar os painéis.

## Mapeamento de superfícies

| Superfície visual preservada | Comportamento conectado | Fonte de dados | Observação de preservação |
|---|---|---|---|
| Hero da missão | Dados da próxima viagem salva, rota no Google Maps/Waze e status da moto | Firestore de viagens e perfil local por UID | Mantém hero, métricas e CTA existentes; somente valores e links passam a ser reais. |
| Ponto de encontro e waypoints | Partida, paradas e destino do roteiro selecionado; confirmação de waypoint | Firestore e estado local por viagem | Mantém cartões, horários, botões `IR` e checkmarks. |
| Aba Mapa | Waypoints do roteiro salvo e abertura de rota externa | Dados do roteiro | Mantém cartografia e lista rápida. |
| Aba Equipe | Identidade real da conta Google e compartilhamento do roteiro | Firebase Authentication e viagem selecionada | Mantém a composição de equipe e o convite. |
| Aba Kit e logística | Perfil da moto, lembrete documental, gastos, locais recentes, checklist e instalação PWA | Perfil/localStorage, sessão de gastos e PWA | Mantém painéis e organização da aba; formulários surgem apenas como lightboxes acionadas por controles já presentes. |

## Exceção operacional mínima

O visual de referência permanece como a única superfície permanente. Para disponibilizar os formulários e telas funcionais já existentes sem inserir cards, menu lateral, nova rota ou qualquer painel na composição, os controles que já pertencem ao desenho acionam uma **lightbox operacional apenas sob demanda**. Fechada, a lightbox não altera a grade, o conteúdo, a tipografia ou o espaçamento da referência; aberta, preserva fechamento por Escape, clique fora e foco acessível.

> **Decisão aprovada pelo proprietário em 19 de agosto de 2026:** manter a lightbox operacional como exceção técnica mínima para expor os fluxos funcionais sem criar uma superfície permanente adicional no frontend de referência.

| Controle visual preservado | Fluxo acessível |
|---|---|
| Marca e título da missão | Roteiros: criar, editar, excluir e abrir no Google Maps/Waze |
| Cartão “Suprimentos · custo por efetivo” | Gastos, local reutilizável e novo registro em lightbox |
| Cartão “Kit de sobrevivência” | Garagem e acesso aos dados reais da moto |
| Título “Equipe” | Perfil da conta Google e logout |
| Título “Kit de missão” e métrica “Moto” | Configurações da moto e instalação PWA |
| Aba Mapa | Pontos do roteiro Firestore quando disponíveis; roteiro estático apenas como fallback |

Os testes diretos em `server/referenceHomeIntegration.test.tsx` cobrem os acessos preservados para roteiros, gastos, garagem, perfil e configurações.

## Verificação pública pré-autenticação

Em 19 de agosto de 2026, a página publicada em `https://mototracker-alpha.vercel.app/` foi verificada antes do login. Ela apresentou a identidade MotoTracker, o botão **Entrar com Google** e a tela de acesso sem o aviso de configuração Firebase ausente. A revisão das abas autenticadas permanece anotada no checklist para execução posterior, conforme orientação do proprietário.

## Funcionalidades obrigatórias a preservar

- Login Google e isolamento de viagens por UID no Cloud Firestore.
- Criação, edição, exclusão confirmada e abertura de roteiros em Google Maps/Waze.
- Perfil da moto por conta, consumo, placa, UF e lembrete documental.
- Registro de gasto com categoria, descrição, valor, local reutilizável e estimativa de combustível.
- Lightbox acessível para registro de despesa.
- PWA instalável com manifesto, service worker e ação nativa de instalação.
- Persistência local do checklist e das preferências pessoais.

## Fora de escopo visual

Não serão importados o layout industrial anterior, menus laterais, cabeçalhos do MotoTracker anterior, paleta Pulse Orange ou novos blocos de página. Componentes funcionais serão adaptados à estrutura visual de referência, não o contrário.
