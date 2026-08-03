# Work Manager — Contexto do projeto

## Visão geral

O Work Manager é um sistema interno de gestão de trabalho e funcionários.

O domínio inclui:

- autenticação e recuperação de senha;
- usuários e situação do vínculo;
- perfis e permissões;
- departamentos e supervisão;
- tarefas, subtarefas e dependências;
- tags, comentários, menções e histórico.

O projeto tem finalidade prática e educacional. Ao propor implementações,
explique decisões técnicas, alternativas e consequências.

## Organização dos repositórios

O Work Manager está dividido em dois repositórios Git independentes:

- `work-manager__back`: API e banco de dados;
- `work-manager__front`: interface web.

Os repositórios são irmãos dentro da pasta `work-manager`.

Uma funcionalidade pode exigir investigação e alterações nos dois projetos.
Antes de implementar uma mudança transversal:

1. Inspecione o contrato existente no back e no front.
2. Explique quais repositórios e arquivos serão afetados.
3. Obtenha autorização antes de modificar cada projeto.
4. Mantenha tipos, payloads, respostas e regras de validação sincronizados.
5. Execute `git status` separadamente em cada repositório.
6. Preserve alterações preexistentes da usuária em ambos os projetos.

A autorização para alterar um repositório não implica automaticamente
autorização para alterar o outro.

## Documentação funcional

A documentação funcional está no Notion, na base:

`Documentação de Funcionalidades — Work Manager`

Cada página deve documentar somente sua própria funcionalidade. Evite colocar
detalhes de Usuários na documentação de Autenticação, por exemplo.

Antes de atualizar uma página:

1. Localize a página dentro da base correta.
2. Leia o conteúdo atual.
3. Apresente a atualização proposta.
4. Aguarde autorização.
5. Faça alterações localizadas e preserve o restante.
6. Confira o conteúdo depois da atualização.

## Contratos e regras de negócio

- O schema do Prisma é a principal referência para o modelo persistido.
- Mudanças no modelo devem considerar schema, migrations, seed, controllers,
  validações, tipos do front e documentação da funcionalidade correspondente.
- Regras de negócio importantes devem ser protegidas no backend, mesmo quando
  o frontend também possui validação.
- O frontend não deve ser considerado uma barreira de segurança.
- Não invente endpoints, campos ou comportamentos sem conferir o código atual.
- Diferencie claramente comportamento implementado, planejado e documentado.

## Frontend

O frontend utiliza:

- Next.js 15 com App Router;
- React 19;
- TypeScript;
- Axios;
- React Hook Form e Zod;
- Tailwind CSS.

Diretórios principais:

- `src/app`: rotas e layouts;
- `src/components`: componentes reutilizáveis;
- `src/screens`: telas compostas;
- `src/services`: chamadas à API;
- `src/contexts`: estados globais;
- `src/types`: contratos TypeScript;
- `src/utils`: utilitários e configuração do Axios.

O servidor de desenvolvimento utiliza normalmente a porta `2400`.

Ao alterar contratos da API:

1. Confira os tipos do front.
2. Confira os services e interceptors do Axios.
3. Considere estados de carregamento, sucesso, erro e sessão expirada.
4. Preserve responsividade e padrões visuais existentes.
5. Não implemente apenas validação visual quando a regra também exige proteção
   no backend.
