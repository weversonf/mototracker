# MotoTracker — navegação funcional

## Renomeação de marca

- [x] Substituir a identificação visível `MotoPulse` por `MotoTracker` no frontend.
- [x] Validar build e sincronizar somente essa alteração ao GitHub/Vercel.
- [x] Verificar a tela de login renomeada em desktop e mobile sem quebra visual.

## Ajuste tipográfico da Garagem

- [x] Reduzir o título principal de “A máquina pronta. Você também.” e validar desktop/mobile.

O título da Garagem foi reduzido de forma exclusiva, sem alterar os demais cabeçalhos. TypeScript e build passaram, o commit `1ac94e4` foi enviado ao GitHub, e a produção já mostra `A máquina pronta. Você também.` em escala menor na rota `?screen=Garagem`.

## Ajuste tipográfico global

- [x] Reduzir um pouco mais os títulos principais de Dashboard, Viagens, Gastos, Garagem, Perfil e Configurações.

O CSS global foi reduzido para `clamp(31px, 4.2vw, 54px)` e a variante compacta da Garagem para `clamp(27px, 3.1vw, 42px)`, com regras próprias menores no mobile. A produção `https://mototracker-alpha.vercel.app/` mostra a escala menor em Garagem, Viagens, Gastos, Perfil e Configurações; a home/Dashboard usa a mesma regra global.

## Persistência de viagens e timeline visual

- [x] Substituído pela arquitetura Firebase: ativar sessão Google e camada Cloud Firestore isolada por usuário, sem criar tabela ou procedimentos tRPC de viagens.
- [x] Resolver os conflitos da migração sem substituir o login Google/Firebase ou a interface MotoTracker.
- [x] Remover o redirecionamento Manus OAuth do bootstrap e manter o AuthProvider Firebase como única porta de autenticação.
- [x] Revalidar a migração com checagem de tipos, servidor local e carregamento do AuthGate Firebase.
- [x] Persistir as viagens no Cloud Firestore, isoladas pelo UID autenticado e protegidas por regras de proprietário.
- [x] Publicar uma regra Firestore segura que preserve as coleções existentes e libere somente `mototrackerUsers/{firebaseUid}/trips` ao respectivo proprietário.
- [x] Confirmar, com teste autenticado, que o proprietário consegue listar e criar viagens no próprio caminho Firestore.
- [x] Confirmar que uma leitura sem autenticação na coleção de viagens é negada com `PERMISSION_DENIED`.
- [x] Confirmar que uma tentativa de escrita sem autenticação na coleção de viagens é negada com `PERMISSION_DENIED`.
- [x] Documentar os resultados finais dos testes negativos de leitura e escrita para comprovar o isolamento por proprietário.
- [x] Manter a viagem de validação `Validação Firebase — Fortaleza` como exemplo real, conforme decisão do proprietário.
- [x] Renomear a exibição do projeto Firebase de `Drivo e Money` para `MotoTracker`, preservando o ID técnico existente.
- [x] Persistir novas viagens com partida, paradas, destino, endereços e coordenadas.
- [x] Carregar somente as viagens do usuário na aba `Planejadas`.
- [x] Melhorar a criação com timeline visual clara e responsiva.
- [x] Validar salvar, recarregar, abrir edição e estados de carregamento/erro do planejador.

## Planejador de viagem em timeline

- [x] Modelar ponto de partida, paradas, destino e endereços exatos.
- [x] Transformar a tela de Viagens em uma timeline editável de roteiro.
- [x] Adicionar links externos para abrir o roteiro no Google Maps ou Waze.
- [x] Validar o fluxo em desktop, mobile e build de produção.

O build local passou com TypeScript e Vite. A produção já possui o deployment `c9f33e4` (“Add editable trip timeline and navigation links”) como **Ready / Production**; a próxima abertura da URL deve refletir a nova tela de Viagens.

O commit `c9f33e4` foi enviado com sucesso para `main` no GitHub e aparece na lista da Vercel como deployment **Ready**, ambiente **Production**, criado aproximadamente 1 minuto após o push.

Na produção `https://mototracker-alpha.vercel.app/?screen=Viagens&planner=c9f33e4`, a nova interface foi confirmada: timeline editável com Florianópolis como origem, Mirante da Serra como parada, Serra do Rastro como destino, links `Maps` por ponto e menu `Ir` com Google Maps (“todas as paradas”) e Waze (“destino final; paradas na timeline”).

## Busca de lugares no Google Maps

- [x] Adicionar sugestões de lugares ao digitar nome ou endereço.
- [x] Preencher nome e endereço exato ao selecionar uma sugestão.
- [x] Manter edição manual e fallback quando a busca não estiver disponível.

O autocomplete usa o carregador compartilhado do Google Maps Places, busca sugestões no Brasil e consulta `formatted_address` ao selecionar um resultado. Se o Maps falhar, o campo continua editável manualmente.

## Separação entre nova viagem e planejadas

- [x] Fazer `Nova viagem` abrir somente o formulário/timeline de preenchimento.
- [x] Exibir as viagens já salvas exclusivamente na aba `Planejadas`.
- [x] Validar retorno entre formulário, Planejadas e demais abas.

O commit `50c0f1c` (“Separate new trip flow and add Google Places search”) passou em TypeScript/build Vite, foi enviado para `main` e já está servido no domínio público. A produção mostra a aba `Planejadas` com os roteiros salvos e a ação `Nova viagem`; ainda falta testar a seleção de uma sugestão real do Google Maps.

Na produção, `Nova viagem` abre exclusivamente o formulário/timeline. Ao digitar `Fortaleza` no ponto de partida, o estado `BUSCANDO NO GOOGLE MAPS` aparece corretamente; falta aguardar o retorno e selecionar uma sugestão real.

Diagnóstico do teste real: a produção caiu no fallback manual ao usar `google.maps.places.AutocompleteService`. A documentação oficial atual recomenda `AutocompleteSuggestion.fetchAutocompleteSuggestions()`, `PlacePrediction.toPlace()` e `Place.fetchFields({ fields: ["displayName", "formattedAddress"] })`. Referências: [Autocomplete Data API](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data) e [Autocomplete Data reference](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data). A implementação local foi migrada para a API nova com fallback legado. O build passou novamente e o commit `c44af50` (“Use current Google Places autocomplete API”) foi enviado para `main`; falta aguardar o deployment e repetir o teste real de `Fortaleza`.

Após o teste publicado continuar caindo no fallback manual, foi adicionado um terceiro caminho por `google.maps.Geocoder`, que preenche sugestões com nome e `formatted_address` mesmo quando Places Autocomplete não está habilitado. TypeScript e build passaram novamente, e o commit `bda015d` (“Add geocoder fallback for place search”) foi enviado para `main`; falta repetir o teste após o redeploy.

Na verificação pós-push, o painel autenticado da Vercel abriu a tela de login e o domínio público ficou momentaneamente em `PREPARANDO SEU DIÁRIO...`, indicando carregamento do bundle novo; é necessário aguardar a aplicação estabilizar antes de testar o campo.

Após o carregamento, o deployment público confirmou a tela `VIAGENS / NOVA VIAGEM` isolada, com apenas o formulário/timeline do novo roteiro, campos de nome, ponto de partida, parada e destino, e o botão `Ver Planejadas`. O teste real do autocomplete pode continuar nesse formulário.

Após o novo redeploy, `bda015d` continua abrindo corretamente a tela isolada de Nova viagem com o formulário completo; o próximo passo é digitar `Fortaleza` novamente e verificar se o Geocoder retorna a sugestão.

O fallback foi ajustado para importar explicitamente `google.maps.importLibrary("geocoding")` antes de instanciar `Geocoder`. O build passou e o commit `75446e7` (“Load geocoding library for place fallback”) foi enviado para `main`; falta repetir o teste após esse redeploy.

O deployment `75446e7` abriu corretamente a tela isolada de Nova viagem com os campos da timeline; falta digitar `Fortaleza` e verificar se aparece uma sugestão com endereço preenchido.

Diagnóstico confirmado no código: o carregador usa `VITE_FRONTEND_FORGE_API_KEY` e `VITE_FRONTEND_FORGE_API_URL`. Essas duas variáveis estão presentes no ambiente local, mas não foram cadastradas na Vercel; por isso o bundle publicado não consegue autenticar o proxy de Google Maps e mostra “Busca do Google Maps indisponível agora”. O formulário manual continua funcionando até essas variáveis serem configuradas.

## Chave própria do Google Maps para a Vercel

- [x] Substituído: manter o autocomplete gratuito Photon/OpenStreetMap, sem dependência de faturamento, APIs Google Maps ou chave na Vercel.
- [x] Substituído: não criar chave Google Maps, pois o Photon já fornece as sugestões de endereços em produção.
- [x] Substituído: nenhuma variável secreta de Maps é necessária na Vercel para o fluxo atual.
- [x] Validar sugestões Photon e preenchimento de endereço em produção.

No Google Cloud Console autenticado, o projeto ativo é `Drivo e Money` (`drivo-e-money`). A página de Credenciais mostra uma chave existente chamada `Browser key (auto created by Firebase)` com 25 APIs associadas, além do cliente OAuth e da conta de serviço. Nenhum valor de chave foi exposto ou copiado; ainda falta verificar faturamento/APIs e decidir se essa chave será restringida ou se será criada uma dedicada. Fonte consultada: https://console.cloud.google.com/apis/credentials?project=drivo-e-money

Ao verificar o faturamento, o Console abriu uma conta existente chamada `Minha conta de faturamento 1`, com custo atual exibido de `R$ 0,00`. Isso sugere que há uma conta disponível para vinculação; ainda é necessário confirmar na tela do projeto se `drivo-e-money` está efetivamente vinculado antes de ativar APIs.

Confirmação final na tela `https://console.cloud.google.com/billing/linkedaccount?project=drivo-e-money`: o projeto ainda informa que **não tem uma conta de faturamento** e **não está vinculado**. A conta `Minha conta de faturamento 1` existe, mas não foi associada ao projeto; não avancei para ativar APIs ou criar chave para evitar uma alteração de cobrança sem autorização.

Nova verificação após a solicitação de continuidade: o projeto continua mostrando **sem conta de faturamento** e **sem vínculo**. A conta aberta no Console é apenas a conta de faturamento disponível, não uma confirmação de associação ao projeto.

Alternativa gratuita escolhida: Photon/Komoot sobre dados OpenStreetMap. O teste público confirmou que `GET https://photon.komoot.io/api/?q=Fortaleza&limit=5` retorna GeoJSON com 5 resultados brasileiros e coordenadas; os parâmetros opcionais `lang=pt`/`countrycode=BR` retornaram HTTP 400 neste endpoint e serão omitidos. A própria página informa que o serviço é gratuito, mas pede uso justo e pode sofrer throttling ou mudanças de disponibilidade. Fontes: https://photon.komoot.io/ e https://github.com/komoot/photon/blob/master/docs/api-v1.md.

A implementação do frontend agora usa somente Photon, com debounce/cancelamento de buscas, normalização de endereço e edição manual como fallback. TypeScript e build Vite passaram, e o commit `3dc60e5` (“Use free Photon geocoding for trip places”) foi enviado para `main`. O bundle foi validado na Vercel e o teste real de `Fortaleza` retornou sugestões.

O domínio `https://mototracker-alpha.vercel.app/?screen=Viagens&flow=planner-v2&places-api=3dc60e5` já serve a tela Nova viagem isolada, com os campos de partida/parada/destino e links Google Maps preservados. Ao digitar `Fortaleza`, o dropdown Photon exibe `Fortaleza — Ceará, Brazil`, `Fortaleza de Minas`, `Fortaleza dos Valos` e outros resultados reais.

O commit `e0d1c39` (“Update trip search helper copy”) foi enviado para `main`; a descrição agora informa seleção de sugestão e endereço exato, sem afirmar que o Google Maps é obrigatório para a busca.

No deployment `e0d1c39`, a produção confirmou `VIAGENS / NOVA VIAGEM`, a instrução “selecione uma sugestão e confirme o endereço exato”, os campos de partida/parada/destino e o link `Maps` por ponto. O Photon permanece como provedor de busca sem chave Google.

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
- [x] Auditar e remover textos, ícones e cards que indiquem GPS ou navegação em tempo real.
- [x] Usar planejamento, roteiro e paradas em vez de “abrir rota” ou tempo até chegada.
- [x] Remover mapa/telemetria de localização das telas de Dashboard e Viagens.
- [x] Auditar integralmente Dashboard e Viagens, registrar as evidências e remover o componente de mapa não utilizado da migração.
- [x] Substituir o indicador ambíguo de `18 min` da próxima viagem por uma métrica de orçamento, sem ETA ou navegação em tempo real.
- [x] Validar a interface sem GPS em desktop/mobile e salvar checkpoint.
- [x] Reintroduzir traçado visual abstrato com linha e pontos de parada.
- [x] Manter fora do produto localização atual, zoom, ETA e instruções de navegação.
- [x] Validar o traçado como elemento de planejamento, não como GPS.

## Validação desta iteração

O traçado aparece como uma linha editorial com pontos de saída, parada e destino no Dashboard e em Viagens. Não há localização atual, zoom, instruções passo a passo, ETA ou ação de iniciar navegação.

## Sincronização GitHub

- [x] Inspecionar branch padrão e conteúdo atual de `weversonf/mototracker`.
- [x] Preparar cópia Git limpa sem incluir segredos, artefatos ou dependências instaladas.
- [x] Sobrescrever o conteúdo remoto com o projeto MotoTracker.
- [x] Verificar o commit enviado e a árvore final no GitHub.

## Firebase e login Google

- [x] Adicionar Firebase Web SDK usando variáveis `VITE_FIREBASE_*`.
- [x] Configurar provedor Google no Firebase Authentication.
- [x] Criar tela inicial de login com Google e estados de carregamento/erro.
- [x] Proteger o Dashboard e restaurar a sessão autenticada.
- [x] Documentar variáveis e domínio autorizado para publicação na Vercel.
- [x] Validar tipos, build e responsividade da tela de login.

## Validação do login

A tela foi validada em desktop e mobile. O botão fica desabilitado de forma explícita enquanto as variáveis `VITE_FIREBASE_*` não forem cadastradas na Vercel; depois disso, o fluxo abre o login Google e o Dashboard só aparece para uma sessão autenticada.

O provedor Google já aparece como ativado no Firebase Console. Resta adicionar `mototracker-alpha.vercel.app` à lista de domínios autorizados, conforme `VERCEL_FIREBASE.md`.

## Deploy na Vercel

- [x] Confirmar autorização para criar/conectar o projeto na conta Vercel.
- [x] Importar `weversonf/mototracker` e revisar build/output da SPA.
- [x] Cadastrar variáveis públicas do Firebase nos ambientes da Vercel.
- [x] Iniciar o deploy e verificar o domínio gerado.
- [x] Confirmar que o domínio publicado `mototracker-alpha.vercel.app` está nos domínios autorizados do Firebase.

### Estado remoto observado

O projeto Vercel `mototracker` já existe na conta `weversonf-6166`, está ligado à branch `main` e ao commit `9b2fb4c`. O domínio atual é `mototracker-alpha.vercel.app`. As seis variáveis do Firebase foram cadastradas em Production e Preview e a Vercel confirmou **Deployment created** após o redeploy.

Na configuração de domínios autorizados do Firebase Authentication, `mototracker-alpha.vercel.app` aparece como domínio personalizado. Dessa forma, o login Google na produção continua autorizado sem exigir alteração nas variáveis ou no código do aplicativo.

Ao abrir o domínio publicado, a resposta exibiu o conteúdo compilado de `server/index.ts` em vez da tela React. O deploy está Ready, mas a configuração de runtime/output da Vercel está incorreta para este projeto e precisa de ajuste antes de considerar a publicação concluída.

O projeto local está no checkpoint `484609a`, que inclui login Google, Firebase e `vercel.json`, mas o deployment observado na Vercel ainda aponta para o commit antigo `9b2fb4c`. É necessário sincronizar o checkpoint mais recente ao repositório GitHub que alimenta a Vercel.

Após o push, o dashboard da Vercel passou a mostrar o commit “Fix Vercel SPA build and add Google Firebase auth” no card do projeto `mototracker`, indicando que o novo deployment foi reconhecido.

O deployment de produção `mototracker-hu0byn9tj-weverson-feitosas-projects.vercel.app` está **Ready**, usando `main` no commit `0c9f724`. O domínio `mototracker-alpha.vercel.app` agora exibe a tela React do MotoTracker com o botão `Entrar com Google`; o servidor Express não está mais sendo servido como conteúdo da página.

Na renomeação da marca, o clone conectado ao GitHub passou na checagem TypeScript e no build Vite, e o commit `a206cc8` foi enviado para `main` com apenas cinco arquivos do frontend. O painel da Vercel já mostra esse commit como deployment **Ready**; a primeira abertura do domínio ainda exibiu a versão anterior, aguardando propagação/cache.

No ajuste do título da Garagem, o build local passou e o commit `1ac94e4` foi enviado para `main` no GitHub. Na última consulta, o painel da Vercel ainda mostrava `a206cc8` como produção, então o novo deployment ainda não havia sido reconhecido pelo webhook.

O formulário da Vercel está com quatro variáveis em edição, mas a opção `Import .env` não expôs um campo visível após o clique. A configuração ainda não foi salva.

Os seis campos `VITE_FIREBASE_*` foram salvos com a configuração do projeto `drivo-e-money` nos ambientes Production e Preview. A Vercel solicitou um redeploy para aplicar as mudanças.

A tentativa de upload automático do arquivo `.env` não encontrou um campo de arquivo acessível; as variáveis foram cadastradas manualmente e salvas com sucesso.

## Banco de dados existente

- [x] Substituído pela configuração Firebase existente, sem reutilizar o banco histórico do repositório.
- [x] Confirmar o mecanismo escolhido: Firebase Authentication + Cloud Firestore do projeto `drivo-e-money`.
- [x] Preservar o frontend estático na Vercel e evitar dependência do template full-stack na publicação.
- [x] Conectar a entidade de viagens ao Cloud Firestore isolado por UID Firebase; gastos e manutenção permanecem no escopo futuro.
- [x] Validar autenticação, leitura e gravação de viagens com compatibilidade do projeto Firebase existente.
