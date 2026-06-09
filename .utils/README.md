# Tacto — Documentação do Projeto

> **Produto:** Plataforma de Gestão de Avaliações Pedagógicas
> **Fase:** MVP
> **Público:** Professores do Ensino Fundamental e Médio
> **Modelo:** Offline-first (Criação Digital → Impressão → Diagnóstico)

---

## Documentos do Planejamento

| # | Arquivo | Para quem? | Conteúdo |
|---|---|---|---|
| 01 | [Visão Geral](./01-visao-geral.md) | Todos | O que é o produto, o que o MVP inclui/exclui e os 4 pilares |
| 02 | [Arquitetura da Informação](./02-arquitetura-informacao.md) | Designer + Dev | Mapa de telas, fluxos de navegação, descrição detalhada de cada tela |
| 03 | [Histórias de Usuário](./03-historias-usuario.md) | Product + Dev | Todas as US com critérios de aceite (definição de "pronto") |
| 04 | [Roadmap](./04-roadmap.md) | Todos | Fases de entrega, estimativas, marcos e o que vem depois do MVP |
| 05 | [Requisitos Técnicos](./05-requisitos-tecnicos.md) | Dev | Stack, banco de dados, APIs, segurança, estrutura de pastas e custos |

---

## Resumo Executivo em 5 Linhas

O **Tacto** é uma plataforma web para professores criarem, exportarem e diagnosticarem avaliações pedagógicas. O MVP roda em modelo **offline-first**: o professor cria a prova na plataforma, imprime, aplica em sala e depois registra os gabaritos para gerar diagnósticos automáticos por turma e por aluno. A IA acelera a criação de questões. O diferencial é o **diagnóstico em camadas** — da turma ao aluno individual — com envio de feedback personalizado por e-mail. O MVP é construído em **~12 semanas** em 4 fases.

---

## Links Rápidos por Perfil

### 🎨 Designer / UX
- [Hierarquia de Navegação](./02-arquitetura-informacao.md#hierarquia-de-navegação)
- [Fluxos Principais](./02-arquitetura-informacao.md#fluxos-principais)
- [Mapa de Telas Detalhado](./02-arquitetura-informacao.md#mapa-de-telas-detalhado)

### 💻 Desenvolvedor
- [Stack Recomendada](./05-requisitos-tecnicos.md#stack-recomendada)
- [Modelagem do Banco de Dados](./05-requisitos-tecnicos.md#modelagem-do-banco-de-dados)
- [APIs e Integrações](./05-requisitos-tecnicos.md#apis-e-integrações-externas)
- [Estrutura de Pastas](./05-requisitos-tecnicos.md#estrutura-de-pastas-do-projeto)
- [Variáveis de Ambiente](./05-requisitos-tecnicos.md#variáveis-de-ambiente-env)

### 📋 Product Owner / Stakeholder
- [O que o MVP inclui/exclui](./01-visao-geral.md#o-que-o-mvp-inclui)
- [Histórias de Usuário completas](./03-historias-usuario.md)
- [Roadmap com marcos](./04-roadmap.md#marcos-de-entrega-milestones)
- [Estimativa de Custos](./05-requisitos-tecnicos.md#estimativa-de-custos-mvp--primeiros-6-meses)

---

## Status dos Épicos

| Épico | Descrição | Fase |
|---|---|---|
| **Épico 1** — Motor de Criação | Geração com IA, editor, banco pessoal, acervo | Fase 1 |
| **Épico 2** — Exportação | Montagem da prova, PDF/DOCX, anti-fraude | Fase 2 |
| **Épico 3** — Diagnóstico | Tabulação, dashboards, histórico, e-mail | Fases 3 e 4 |
| **Épico 4** — Fundação | Auth, turmas, importação CSV | Fase 0 |
