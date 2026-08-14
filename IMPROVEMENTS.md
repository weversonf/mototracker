# Melhorias recomendadas — MotoTracker

O MotoTracker já oferece autenticação Google, planejamento de viagens persistido e um primeiro fluxo de gastos e cadastro da moto. As próximas melhorias devem consolidar os dados que o piloto passa a registrar, evitando recursos de GPS em tempo real e mantendo o produto orientado a planejamento, histórico e cuidado com a moto.

| Prioridade | Melhoria | Impacto esperado | Escopo inicial seguro |
|---|---|---|---|
| Alta | Persistir o perfil da moto no Cloud Firestore | Permite restaurar o cadastro em outros dispositivos e associá-lo à conta, não apenas ao navegador atual. | Criar um documento de perfil por UID, com validação e regras de proprietário equivalentes às viagens. |
| Alta | Persistir lançamentos de gastos | Transforma o formulário financeiro em histórico consultável, com totais reais por categoria e período. | Salvar categoria, descrição, valor, data e estimativa de litros quando aplicável. |
| Alta | Registrar manutenção | Permite guardar serviço, quilometragem, data, valor e próxima revisão de forma real. | Adicionar um formulário de serviço e uma lista inicialmente vazia na Garagem. |
| Média | Concluir uma viagem planejada | Distingue roteiros em planejamento do histórico efetivamente realizado. | Incluir ação explícita de conclusão, data e observações, sem localização em tempo real. |
| Média | Exportar o diário | Facilita conferência e cópia de segurança dos dados pessoais. | Exportar viagens, gastos e manutenção em CSV ou JSON mediante ação manual do piloto. |
| Média | Melhorar a disponibilidade da busca de lugares | Ajuda no planejamento quando o provedor público estiver indisponível. | Manter edição manual, cache de sugestões recentes e uma mensagem de indisponibilidade objetiva. |
| Baixa | Fotografias de comprovantes e serviços | Enriquece o histórico da moto com evidências pessoais. | Enviar arquivos ao armazenamento e salvar somente metadados e referências no banco. |
| Baixa | Lembretes configuráveis | Ajuda a não esquecer revisões e documentação, sem supor calendários oficiais. | Permitir que o piloto informe data ou quilometragem desejada para um aviso próprio. |

> **Diretriz de produto:** os próximos fluxos devem continuar sem GPS, rastreamento ao vivo, ETA ou navegação passo a passo. O aplicativo registra e organiza informações do motociclista; os links externos continuam sendo apenas uma conveniência para abrir um roteiro salvo no aplicativo de mapas escolhido.

## Ordem sugerida

Primeiro, é recomendável persistir o perfil da moto e os gastos no Cloud Firestore. Em seguida, o registro de manutenção pode usar a mesma estrutura de conta e permitir que a Garagem passe do estado inicial vazio para um histórico real. Com esses três blocos concluídos, os resumos do Dashboard deixam de depender de estados vazios e passam a refletir apenas os dados fornecidos pelo próprio piloto.
