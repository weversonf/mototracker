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

## Publicação das correções

O commit `f542168` foi enviado para a branch `main`. Na primeira verificação do domínio público, a Vercel ainda servia o bundle anterior, que exibia o Perfil fixo. A publicação será verificada novamente após a propagação automática; esse resultado inicial não é considerado regressão do código corrigido.

Na verificação seguinte, a Vercel passou a servir a versão corrigida: a tela Perfil exibe **Weverson Feitosa**, `weversonf@gmail.com`, as iniciais `WF` e a ação **Sair da conta**. A ação foi inspecionada, mas não acionada para preservar a sessão autenticada no navegador.

## Regressões e responsividade

Após as correções, a suíte Vitest foi aprovada com **6 testes** em **3 arquivos**; TypeScript e build estático também foram aprovados. A correção de coordenadas conta com teste unitário, assim como os dados de identidade da conta Firebase. A visualização mobile do AuthGate local não apresentou overflow ou sobreposição. O ambiente de preview local não possui as variáveis Firebase de produção, por isso apresenta corretamente a orientação de configuração em vez do conteúdo autenticado.

O build mantém um aviso de bundle JavaScript acima de 500 kB após minificação. Ele não impede a execução atual, mas é uma oportunidade de melhoria de performance.

## Fechamento da auditoria

O erro `ERR_MODULE_NOT_FOUND` de `dotenv` observado em uma inicialização antiga não voltou a ocorrer após `pnpm install` e o reinício do servidor. As entradas recentes mostram o servidor iniciado normalmente em `http://localhost:3000/`.

A configuração Vitest foi ampliada para executar testes TSX com o plugin React e ambiente JSDOM. A suíte final aprovou **9 testes** em **4 arquivos**, incluindo: edição manual de ponto limpa coordenadas antigas; Perfil usa a identidade Firebase; o botão **Sair da conta** chama `signOutUser`; o AuthGate volta à entrada Google sem usuário; e os controles da conta permanecem presentes em um viewport autenticado de 375 px. TypeScript e build estático também foram aprovados.

> O cenário de 375 px é uma cobertura automatizada de DOM. A validação visual e funcional em um navegador mobile realmente autenticado permanece pendente para encerrar esta auditoria com evidência de produção.

## Endereço Vercel alternativo

O domínio `mototracker.vercel.app` já resolve para um projeto externo, portanto não pode ser usado pelo MotoTracker. A consulta pública a `mototrackerbr.vercel.app` devolveu `404 DEPLOYMENT_NOT_FOUND`, sem conteúdo de outro projeto; isso indica que ele não está publicamente vinculado a uma implantação. O vínculo definitivo ainda precisa ser confirmado nas configurações do projeto Vercel antes de alterar a rota de produção.

O projeto correto foi localizado no escopo **Weverson Feitosa's projects** da Vercel, em `https://vercel.com/weverson-feitosas-projects/mototracker/settings/domains`. A página confirma `mototracker-alpha.vercel.app` como domínio de produção atual e oferece a ação **Add Existing**, necessária para registrar um segundo endereço sem remover o atual.

## Correções adicionais de formulários

O formulário de **Gastos** agora exige três dados antes de incluir um lançamento no histórico local: categoria, descrição do que foi pago e valor. Para combustível, ele mostra uma estimativa de litros quando o consumo médio e uma distância opcional forem informados.

Em **Nova viagem**, os campos de partida, parada e destino continuam diretamente editáveis por clique ou toque. Ao digitar manualmente depois de escolher uma sugestão, as coordenadas antigas são removidas para que o endereço visível e os links externos não divirjam.

Em **Configurações**, foi incluído o cadastro local da moto — modelo, apelido, final da placa, UF e consumo em km/L. O lembrete de documentação não tenta prever vencimentos ou valores: ele orienta a consulta do calendário oficial de IPVA/licenciamento do estado correspondente.

## Regressão da timeline

O teste de interface `routesEditor.test.tsx` cobre a timeline em viewport de 375 px: a partida recebe foco direto, uma sugestão Photon é selecionada e, em seguida, o nome e o endereço são editados manualmente. Antes de salvar, o teste confirma que as coordenadas antigas não estão presentes no payload. A suíte passou com **16 testes** em **7 arquivos**, junto de TypeScript e build estático aprovados.
