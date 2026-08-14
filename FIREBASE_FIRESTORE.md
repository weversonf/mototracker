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
