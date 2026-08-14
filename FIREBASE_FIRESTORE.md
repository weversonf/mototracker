# Firestore do MotoTracker

O projeto Firebase **drivo-e-money** já possui o banco Cloud Firestore padrão ativo na região `southamerica-east1`. A verificação no Console confirmou coleções existentes não relacionadas ao MotoTracker; o aplicativo grava apenas a coleção abaixo e não altera essas coleções.

```text
mototrackerUsers/{firebaseUid}/trips/{tripId}
```

Cada viagem mantém `firebaseUid`, `name`, `tag`, `points`, `createdAt` e `updatedAt`. O caminho e as regras tornam o UID Firebase o limite de acesso: uma pessoa autenticada só pode ler, criar, editar ou remover os próprios roteiros.

## Publicação das regras

O arquivo `firestore.rules` precisa ser publicado uma vez no Console Firebase. Abra **Firestore Database → Regras**, substitua o conteúdo pelo arquivo deste repositório e publique. Não use o modo de teste em produção.

As regras foram deliberadamente restritas à coleção `mototrackerUsers/{firebaseUid}/trips/{tripId}`. Elas não concedem acesso a `banks`, `categories`, `goals`, `transactions`, `userSettings`, `users` ou a qualquer outro dado existente no projeto.

> A publicação das regras é uma alteração de segurança no banco de produção e deve ser revisada pelo proprietário do projeto antes de ser confirmada no Console.

## Estado verificado no Console

As regras anteriormente publicadas eram temporárias, cobriam **todo o banco** e tinham vencimento em `2026-03-14`. A nova política do MotoTracker está preenchida no editor e aparece como a versão mais recente no histórico do Console. Porém, a gravação de uma viagem autenticada será o critério final para confirmar que a publicação foi concluída e que o acesso está isolado corretamente.

## Identidade do projeto

O nome de exibição do projeto Firebase foi atualizado com sucesso de **Drivo e Money** para **MotoTracker**. O ID técnico continua sendo `drivo-e-money`; por isso, os valores de `projectId`, `authDomain`, `appId`, a configuração da Vercel e os dados existentes foram preservados.

## Sincronização da aplicação

O commit `d5e8d68` (`Persist trips with Firebase Firestore`) foi enviado à branch `main` do repositório `weversonf/mototracker`. A abertura da produção imediatamente após o envio ainda mostrou a versão anterior, com os três roteiros locais de exemplo. Na verificação seguinte, o domínio já apresentou o novo estado **“Carregando planejadas”**, o que confirma que o bundle atualizado está ativo e iniciou o listener do Firestore. A validação fim a fim seguirá assim que a resposta inicial do serviço for recebida.

O listener respondeu com o estado **“Nenhuma viagem planejada”**, sem mensagem de permissão negada. Isso confirma que a sessão Firebase atual consegue consultar a coleção isolada do MotoTracker e receber uma lista vazia autorizada. A validação de criação, atualização e recarregamento segue em andamento pela interface publicada.

Durante a criação de uma viagem de validação, a busca Photon retornou sugestões reais para `Fortaleza`, e o formulário também aceitou o endereço manual `Fortaleza, Ceará, Brasil`. Assim, o teste cobre a persistência mesmo quando o usuário opta pelo fallback manual em vez de selecionar uma sugestão.

Ao selecionar a primeira sugestão de Fortaleza, a tela preencheu a origem com `Ceará, Brazil` e exibiu a sequência visual separada de **partida** (laranja), **parada** (azul) e **destino** (verde). Isso confirma a aplicação da nova hierarquia da timeline no ambiente de produção.

O roteiro de validação foi completado com **Fortaleza** como partida, **Beberibe** como parada e **Canoa Quebrada** como destino. Os três pontos foram selecionados das sugestões Photon, preenchendo endereço e coordenadas antes do envio ao Firestore.

## Validação fim a fim concluída

A viagem `Validação Firebase — Fortaleza` foi gravada com sucesso pela produção autenticada. O aplicativo exibiu a confirmação **“Planejamento salvo”** e retornou à aba **Planejadas**, onde a viagem apareceu com **1 parada** e as ações **Editar** e **Ir**. Junto da leitura vazia autorizada verificada antes da criação, esse resultado confirma que a regra Firestore está em vigor e permite ao usuário autenticado listar e criar viagens dentro do próprio caminho de coleção.

> A viagem de validação é um dado real na conta Firebase atualmente conectada. Ela deve ser removida somente se o proprietário confirmar que não deseja mantê-la.

No Console Firebase, o histórico destaca a versão atual das regras, datada de **hoje, 23:27**, e o editor mostra exatamente a política do MotoTracker: autenticação obrigatória, comparação entre `request.auth.uid` e o UID do caminho, validação de formato na criação e preservação do proprietário na atualização. A próxima etapa é executar uma simulação com um UID distinto para validar a negação de acesso cruzado.

### Testes negativos de acesso

Foram realizadas duas chamadas REST **sem token Firebase nem API key** contra o caminho isolado `mototrackerUsers/uid-nao-autenticado/trips`:

| Operação | Caminho / identificador | Resultado |
|---|---|---|
| Leitura de documento | `.../trips/teste-negativo` | `HTTP 403` — `PERMISSION_DENIED` |
| Criação de documento | `.../trips?documentId=teste-negativo-escrita` | `HTTP 403` — `PERMISSION_DENIED` |

Nas duas respostas, o Firestore retornou `Missing or insufficient permissions.`. Nenhum documento foi criado pela tentativa de escrita. Em conjunto com a criação e leitura bem-sucedidas da sessão autenticada, isso confirma que a coleção não está aberta ao público e que somente uma sessão Firebase cujo UID coincida com o caminho pode passar pela condição `isOwner`.
