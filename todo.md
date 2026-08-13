# MotoPulse — navegação funcional

- [x] Mapear o estado compartilhado da navegação entre sidebar e menu inferior.
- [x] Criar tela funcional de Dashboard com ações de sessão e resumo da viagem.
- [x] Criar tela funcional de Rotas com rotas salvas, filtros e início de navegação.
- [x] Criar tela funcional de Garagem com moto selecionada, manutenção e telemetria.
- [x] Criar tela funcional de Perfil com preferências, segurança e modo de pilotagem.
- [x] Implementar sidebar móvel com overlay, fechamento por ação e tecla Escape.
- [x] Validar navegação, responsividade, tipos e build de produção.
- [x] Remover o velocímetro da tela inicial e definir um resumo focado em decisão rápida.
- [x] Priorizar próxima ação, status da moto, última atividade e condições da estrada.
- [x] Mover a telemetria detalhada para a Garagem ou para o modo de rolê ativo.
- [x] Validar a nova home em desktop e mobile e salvar novo checkpoint.
- [x] Reposicionar a home para planejamento e registro de viagens.
- [x] Separar Rotas em planejar viagem, viagens salvas e histórico.
- [x] Criar módulo de manutenção com serviços, vencimentos e histórico.
- [x] Criar módulo financeiro para combustível, manutenção e lavagem.
- [x] Adicionar resumo de gastos e custo por viagem no dashboard.
- [x] Adicionar formulários/quick actions para registrar abastecimento, lavagem e serviço.
- [x] Validar a arquitetura em desktop/mobile e salvar checkpoint.
- [x] Reorganizar a área financeira em visão mensal, categorias e custo por viagem.
- [x] Substituir números soltos por um resumo visual de distribuição de gastos.
- [x] Destacar lançamentos recentes e tornar o registro de gasto mais acionável.
- [x] Validar a área financeira em desktop/mobile e salvar checkpoint.
- [ ] Auditar e remover textos, ícones e cards que indiquem GPS ou navegação em tempo real.
- [ ] Trocar “abrir rota” e tempo até chegada por planejamento, roteiro e paradas da viagem.
- [ ] Remover mapa/telemetria de localização das telas de Dashboard e Viagens.
- [x] Validar a interface sem GPS em desktop/mobile e salvar checkpoint.
- [x] Reintroduzir traçado visual abstrato com linha e pontos de parada.
- [x] Manter fora do produto localização atual, zoom, ETA e instruções de navegação.
- [x] Validar o traçado como elemento de planejamento, não como GPS.

## Validação desta iteração

O traçado aparece como uma linha editorial com pontos de saída, parada e destino no Dashboard e em Viagens. Não há localização atual, zoom, instruções passo a passo, ETA ou ação de iniciar navegação.

## Sincronização GitHub

- [x] Inspecionar branch padrão e conteúdo atual de `weversonf/mototracker`.
- [x] Preparar cópia Git limpa sem incluir segredos, artefatos ou dependências instaladas.
- [x] Sobrescrever o conteúdo remoto com o projeto MotoPulse.
- [x] Verificar o commit enviado e a árvore final no GitHub.

## Firebase e login Google

- [x] Adicionar Firebase Web SDK usando variáveis `VITE_FIREBASE_*`.
- [ ] Configurar provedor Google no Firebase Authentication.
- [x] Criar tela inicial de login com Google e estados de carregamento/erro.
- [x] Proteger o Dashboard e restaurar a sessão autenticada.
- [x] Documentar variáveis e domínio autorizado para publicação na Vercel.
- [x] Validar tipos, build e responsividade da tela de login.

## Validação do login

A tela foi validada em desktop e mobile. O botão fica desabilitado de forma explícita enquanto as variáveis `VITE_FIREBASE_*` não forem cadastradas na Vercel; depois disso, o fluxo abre o login Google e o Dashboard só aparece para uma sessão autenticada.

O provedor Google e os domínios autorizados ainda dependem de configuração manual no Firebase Console, conforme `VERCEL_FIREBASE.md`.

## Deploy na Vercel

- [x] Confirmar autorização para criar/conectar o projeto na conta Vercel.
- [x] Importar `weversonf/mototracker` e revisar build/output da SPA.
- [x] Cadastrar variáveis públicas do Firebase nos ambientes da Vercel.
- [x] Iniciar o deploy e verificar o domínio gerado.
- [ ] Adicionar o domínio publicado aos domínios autorizados do Firebase.

### Estado remoto observado

O projeto Vercel `mototracker` já existe na conta `weversonf-6166`, está ligado à branch `main` e ao commit `9b2fb4c`. O domínio atual é `mototracker-alpha.vercel.app`. As seis variáveis do Firebase foram cadastradas em Production e Preview e a Vercel confirmou **Deployment created** após o redeploy.

Ao abrir o domínio publicado, a resposta exibiu o conteúdo compilado de `server/index.ts` em vez da tela React. O deploy está Ready, mas a configuração de runtime/output da Vercel está incorreta para este projeto e precisa de ajuste antes de considerar a publicação concluída.

O projeto local está no checkpoint `484609a`, que inclui login Google, Firebase e `vercel.json`, mas o deployment observado na Vercel ainda aponta para o commit antigo `9b2fb4c`. É necessário sincronizar o checkpoint mais recente ao repositório GitHub que alimenta a Vercel.

O formulário da Vercel está com quatro variáveis em edição, mas a opção `Import .env` não expôs um campo visível após o clique. A configuração ainda não foi salva.

Os seis campos `VITE_FIREBASE_*` foram salvos com a configuração do projeto `drivo-e-money` nos ambientes Production e Preview. A Vercel solicitou um redeploy para aplicar as mudanças.

A tentativa de upload automático do arquivo `.env` não encontrou um campo de arquivo acessível; as variáveis foram cadastradas manualmente e salvas com sucesso.

## Banco de dados existente

- [ ] Recuperar do histórico do `mototracker` o schema, migrations e configuração do banco.
- [ ] Confirmar se o banco original ainda está acessível e identificar o mecanismo usado.
- [ ] Migrar o frontend estático para o template full-stack sem alterar dados existentes.
- [ ] Conectar viagens, gastos, manutenção e abastecimentos às tabelas existentes.
- [ ] Validar autenticação, leitura, gravação e compatibilidade do banco.
