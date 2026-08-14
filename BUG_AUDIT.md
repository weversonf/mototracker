# Auditoria de bugs — MotoTracker

## Evidências de execução

Em produção, a tela **Viagens > Planejadas** apresentou inicialmente o estado de carregamento e, após a resposta do Firestore, exibiu a viagem autenticada `Validação Firebase — Fortaleza` com as ações **Editar** e **Ir**. Isso confirma que a espera pelo listener é transitória e não corresponde a um travamento.

Os comandos `pnpm test`, `pnpm run check` e `pnpm run build:client` concluíram sem falhas. A análise apontou apenas o aviso de bundle JavaScript acima de 500 kB após minificação, classificado como oportunidade de performance, não como defeito funcional.

## Defeito confirmado

Quando um ponto de rota já selecionado pelo Photon é editado manualmente, as coordenadas anteriormente escolhidas permanecem no objeto. Como os links externos de roteiro podem preferir coordenadas a texto, o endereço visível e o destino aberto no Google Maps/Waze podem divergir. A correção deve descartar `coordinates` em toda alteração manual de nome ou endereço; a seleção de uma nova sugestão voltará a preencher coordenadas consistentes.

## Segundo defeito confirmado

O contexto Firebase expõe `signOutUser`, mas nenhuma tela o utiliza. Um usuário autenticado não encontra uma forma de trocar de conta ou encerrar sua sessão no aplicativo. A correção deve incluir uma ação explícita de saída na tela **Perfil**, com retorno automático ao AuthGate após a conclusão.

## Terceiro defeito confirmado

A tela **Perfil** mostra nome, iniciais e informações de piloto fixas (`Rafael Barros` / `RB`), independentemente da conta Google autenticada. Isso causa incompatibilidade com a sessão real. O cartão precisa usar `displayName`, `email` e iniciais derivados de `user` do Firebase, preservando um fallback neutro quando algum campo não estiver disponível.
