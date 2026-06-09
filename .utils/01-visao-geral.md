# Tacto — Plataforma de Avaliações Pedagógicas
## Visão Geral do Projeto

> **Fase atual:** MVP (Mínimo Produto Viável)
> **Público-alvo:** Professores do Ensino Fundamental e Médio
> **Modelo de operação:** Offline-first — Criação Digital → Impressão → Diagnóstico

---

## O Problema que Resolvemos

Professores gastam horas criando avaliações do zero, corrigindo manualmente e ainda não conseguem extrair um diagnóstico claro sobre o desempenho de cada aluno. O Tacto resolve isso em três movimentos:

1. **Cria** — O professor monta uma prova com ajuda de IA, em minutos
2. **Aplica** — Imprime e aplica normalmente (sem depender de internet ou dispositivos dos alunos)
3. **Diagnostica** — Registra os gabaritos e recebe um painel completo de desempenho por turma e por aluno

---

## O que o MVP *inclui*

| Área | O que o professor consegue fazer |
|---|---|
| **Criação de Questões** | Gerar com IA, editar, criar manualmente ou buscar no acervo público |
| **Banco Pessoal** | Salvar e organizar questões por disciplina e competência |
| **Montagem de Prova** | Selecionar questões, definir pesos e ordenar o caderno |
| **Exportação** | Gerar PDF (impressão) e DOCX (edição final), com gabarito e múltiplas versões anti-fraude |
| **Tabulação** | Registrar respostas dos alunos com interface ágil |
| **Diagnóstico** | Dashboard da turma, perfil individual e histórico bimestral |
| **Feedback Automático** | Enviar relatório personalizado por e-mail para cada aluno |
| **Gestão de Acesso** | Cadastro, login (e-mail ou Google), gestão de turmas e importação de lista de chamada |

## O que o MVP *não inclui* (para versões futuras)

- Portal online para os alunos responderem a prova diretamente na plataforma
- Aplicativo mobile
- Integração com sistemas escolares (SIGAs, diários eletrônicos)
- Múltiplos professores por escola / gestão centralizada de escola

---

## Os 4 Pilares do MVP

```
┌─────────────────────────────────────────────────────────────────┐
│  ÉPICO 1           ÉPICO 2          ÉPICO 3         ÉPICO 4     │
│  Motor de          Core             Diagnóstico     Fundação     │
│  Criação           Operacional      Analítico       de Acesso    │
│                                                                   │
│  • IA gera         • Monta          • Dashboard     • Cadastro   │
│    questões          caderno          turma         • Login      │
│  • Editor          • PDF / DOCX     • Perfil        • Turmas     │
│  • Manual          • Anti-fraude      individual    • Import CSV │
│  • Banco pessoal                    • Histórico                  │
│  • Busca acervo                     • E-mail auto               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Próximos Documentos

| Arquivo | Conteúdo |
|---|---|
| `02-arquitetura-informacao.md` | Mapa completo de telas, fluxos e hierarquia de navegação |
| `03-historias-usuario.md` | Todas as User Stories com critérios de aceite |
| `04-roadmap.md` | Fases de entrega com estimativas e priorização |
| `05-requisitos-tecnicos.md` | Stack, banco de dados, APIs e decisões de arquitetura |
