# TaskFlow — Gerenciador de Tarefas Web

## Objetivo
Aplicação web para cadastrar, organizar e acompanhar tarefas pessoais em um quadro Kanban, com indicadores de produtividade. O projeto funciona inteiramente no navegador, sem backend.

## Funcionalidades
- Dashboard com total de tarefas, tarefas a fazer, em andamento e concluídas.
- Cadastro com título, descrição, prioridade, prazo, responsável, projeto/categoria e status.
- Quadro Kanban com três colunas: A Fazer, Em Andamento e Concluídas.
- Edição e exclusão de tarefas.
- Alteração do status pelo seletor de cada cartão.
- Pesquisa pelo título.
- Filtros simultâneos por prioridade e status, com opção para limpar.
- Salvamento automático no `localStorage`, mantendo os dados após atualizar ou reabrir a página.
- Avisos visuais para tarefas com prazo vencido.
- Interface responsiva para computador, tablet e celular.

## Tecnologias
- HTML5
- CSS3
- JavaScript puro (sem frameworks ou bibliotecas)
- `localStorage` do navegador

## Como executar
1. Baixe ou clone este repositório.
2. Extraia os arquivos, se necessário.
3. Abra a pasta do projeto.
4. Dê dois cliques em `index.html` ou abra-o em um navegador atualizado.

Não é necessário instalar dependências, iniciar servidor ou configurar banco de dados.

## Estrutura
```text
taskflow/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Armazenamento
As tarefas são armazenadas localmente no navegador, na chave `taskflow.tasks.v1`. Os dados ficam no navegador e perfil em que foram cadastrados. Limpar os dados do navegador pode apagar as tarefas.

## Integrantes
- Preencher com o(s) nome(s) do(s) aluno(s).

## Observação para apresentação
Os integrantes devem conseguir explicar variáveis, arrays, objetos, funções, eventos, manipulação do HTML, conversão JSON, `localStorage` e o funcionamento da pesquisa e dos filtros.
