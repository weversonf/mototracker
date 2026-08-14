# Auditoria do MotoTracker

**Escopo da revisão:** login, Dashboard, Viagens, Gastos, Garagem, Perfil e Configurações. A análise considerou as jornadas implementadas, a persistência configurada e a suíte local executada após a correção da Garagem.

> **Resultado da validação local:** 9 arquivos de teste e 20 testes aprovados; TypeScript e build estático concluídos. A validação com sessão Google real em um celular continua sendo uma etapa separada, pois depende da conta do proprietário.

## Correção entregue nesta revisão

O cadastro de moto passou a ter uma única rotina de leitura, vinculada à chave da conta conectada. **Configurações**, **Gastos** e **Garagem** agora consultam a mesma origem local por UID. Assim, quando existir um modelo salvo, a Garagem deixa de exibir o estado “Nenhuma moto cadastrada” e mostra apelido ou modelo, consumo médio, final da placa, UF e o lembrete documental correspondente.

| Jornada | Estado observado | Avaliação |
|---|---|---|
| Login | A entrada é exclusiva com Google e a sessão é restaurada pelo Firebase. | Adequado ao escopo atual. |
| Dashboard | O primeiro uso está limpo e conduz corretamente ao planejamento, à Garagem e aos Gastos. | A estrutura é boa, mas ainda não consolida dados reais após o uso. |
| Viagens | Cria, edita, remove com confirmação e acompanha roteiros em tempo real no Firestore por UID. | É a jornada mais madura; falta transformar uma planejada em viagem concluída. |
| Gastos | Aceita categoria, descrição, valor e estima litros conforme o consumo da moto. | Os lançamentos existem apenas enquanto a página permanece aberta. |
| Garagem | Mostra o perfil salvo e orienta a documentação. | Ainda não tem registros reais de manutenção. |
| Configurações | Salva modelo, placa, UF e consumo por conta no armazenamento local do navegador. | Há controles visuais de aparência e alertas que ainda não persistem nem alteram comportamento. |
| Perfil | Exibe a conta Google e encerra a sessão corretamente. | Preferências e “Editar perfil” ainda não têm persistência ou edição real. |

## Melhorias recomendadas

| Prioridade | Melhoria | Razão | Primeiro incremento seguro |
|---|---|---|---|
| Alta | Persistir perfil da moto no Firestore | O perfil atual é separado por navegador; trocar de celular ou limpar dados remove o cadastro local. | Criar `mototrackerUsers/{uid}/profile/bike`, com as mesmas regras de proprietário das viagens. |
| Alta | Persistir e gerenciar gastos | O resumo financeiro não pode refletir o histórico real enquanto os lançamentos vivem apenas na sessão. | Criar coleção de gastos por UID com criar, listar, editar e excluir; calcular totais por categoria no cliente. |
| Alta | Criar manutenção real | O produto propõe manutenção, mas ainda não registra serviço, quilometragem, data, custo ou próxima revisão. | Adicionar formulário de serviço e lista vazia na Garagem antes de incluir lembretes. |
| Alta | Tornar o Dashboard orientado a dados reais | Depois do primeiro uso, os cartões continuam em estado inicial mesmo com dados existentes. | Derivar métricas de viagens, gastos e perfil persistidos; manter estado vazio quando não houver dados. |
| Média | Concluir uma viagem planejada | Hoje “Histórico” não recebe roteiros concluídos. | Incluir “Concluir viagem”, data, odômetro e observações, sem GPS ou navegação em tempo real. |
| Média | Persistir preferências ou remover controles provisórios | Interruptores e o botão “Editar perfil” sugerem uma função que ainda não é aplicada. | Salvar somente preferências implementadas ou substituir ações provisórias por texto explicativo. |
| Média | Resiliência no login móvel | O login por janela pode ser bloqueado por alguns navegadores móveis. | Prever tentativa de redirecionamento quando o pop-up não puder abrir e mostrar retorno claro ao usuário. |
| Média | Reduzir o pacote inicial | O build atual sinalizou um arquivo JavaScript acima do limite recomendado pelo bundler. | Carregar telas secundárias sob demanda e separar bibliotecas de interface em chunks. |
| Média | Testes autenticados de ponta a ponta | A suíte cobre regras e componentes, mas não valida a jornada Firebase em um dispositivo real. | Criar roteiro manual de aceite para login, cadastro, viagem, exclusão e leitura em celular. |

## Sequência recomendada

A maior alavanca é criar uma camada única de dados pessoais no Firestore: primeiro o **perfil de moto**, depois **gastos** e em seguida **manutenções**. Com isso, Dashboard e Garagem deixam de depender de estado local, passam a funcionar entre dispositivos e exibem somente informações fornecidas pelo piloto. Depois, a conclusão de viagens pode alimentar o Histórico sem introduzir GPS, ETA, rastreamento ao vivo ou instruções de navegação.

> **Diretriz preservada:** MotoTracker deve continuar sendo um organizador de viagens, gastos e manutenção. Google Maps e Waze são saídas externas para um roteiro salvo, não recursos de navegação dentro do aplicativo.
