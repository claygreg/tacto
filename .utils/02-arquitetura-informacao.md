# Arquitetura da Informação — Tacto MVP

> Este documento descreve a estrutura de telas, fluxos de navegação e hierarquia de páginas da plataforma.

---

## Hierarquia de Navegação

```
TACTO
│
├── 🔓 ÁREA PÚBLICA (sem login)
│   ├── /                     → Landing Page (apresentação + CTA de cadastro)
│   ├── /login                → Tela de login (e-mail/senha ou Google)
│   └── /cadastro             → Tela de criação de conta
│
└── 🔐 ÁREA AUTENTICADA (professor logado)
    │
    ├── /dashboard            → Home do professor (resumo de turmas + atalhos)
    │
    ├── /questoes             → Banco de Questões
    │   ├── /questoes/novo    → Criar/Gerar questão (IA ou manual)
    │   ├── /questoes/:id     → Visualizar/Editar questão
    │   └── /questoes/acervo  → Busca no acervo público
    │
    ├── /provas               → Lista de Avaliações criadas
    │   ├── /provas/nova      → Montagem do caderno de prova
    │   ├── /provas/:id       → Detalhes da prova / Exportação
    │   └── /provas/:id/gabarito → Tabulação de respostas
    │
    ├── /diagnostico          → Central de Diagnóstico
    │   ├── /diagnostico/:provaId          → Dashboard da turma (Nível 1)
    │   ├── /diagnostico/:provaId/:alunoId → Perfil individual (Nível 2)
    │   └── /diagnostico/historico         → Evolução bimestral (Nível 3)
    │
    ├── /turmas               → Gestão de Turmas
    │   ├── /turmas/nova      → Criar turma
    │   ├── /turmas/:id       → Detalhes da turma + lista de alunos
    │   └── /turmas/:id/import → Importar lista via CSV
    │
    └── /conta                → Configurações do perfil e conta
```

---

## Fluxos Principais

### Fluxo 1 — Criar e Exportar uma Prova

```
[Dashboard]
    │
    ▼
[Provas → Nova Prova]
    │
    ├── Escolhe turma e nome da prova
    │
    ▼
[Montagem do Caderno]
    │
    ├── Aba "Banco Pessoal" → seleciona questões salvas
    ├── Aba "Acervo Público" → busca e importa questões externas
    └── Aba "Criar Nova"    → abre o editor de questões (IA ou manual)
    │
    ▼
[Configurações da Prova]
    │
    ├── Define peso de cada questão
    ├── Escolhe nº de versões (anti-fraude: A, B...)
    └── Configura cabeçalho institucional
    │
    ▼
[Exportação]
    │
    ├── Baixa PDF (impressão)
    └── Baixa DOCX (edição)
```

---

### Fluxo 2 — Criar uma Questão com IA

```
[Banco de Questões → Criar Nova]
    │
    ▼
[Modo IA selecionado]
    │
    ├── Preenche: Tema / Disciplina / Ano Escolar / Habilidade (BNCC)
    ├── Escolhe tipo: Objetiva (A/B/C/D/E) ou Discursiva
    └── Clica em "Gerar"
    │
    ▼
[Questão gerada exibida]
    │
    ├── Edita enunciado, alternativas e texto-base se necessário
    ├── Marca a alternativa correta
    └── Tagueia por disciplina e competência
    │
    ▼
[Salva no Banco Pessoal]
```

---

### Fluxo 3 — Tabular e Diagnosticar

```
[Prova exportada e aplicada em papel]
    │
    ▼
[Provas → :id → Gabarito]
    │
    ├── Lista de alunos da turma exibida
    ├── Para cada aluno: clica nas alternativas marcadas
    └── Confirma quando todos registrados
    │
    ▼
[Diagnóstico → Dashboard da Turma]
    │
    ├── Gráfico de desempenho geral
    ├── Heatmap por habilidade/conteúdo
    ├── Ranking de questões mais erradas
    └── Botão "Enviar Feedback por E-mail"
    │
    ▼
[Perfil Individual do Aluno]
    │
    ├── Acertos e erros por questão
    ├── Mapa de habilidades da BNCC
    └── Sugestão de intervenção
```

---

## Mapa de Telas (Detalhado)

### T01 — Landing Page
- Proposta de valor em destaque
- Demonstração visual do produto (screenshot ou animação)
- CTA: "Comece grátis" → `/cadastro`
- Link para login

### T02 — Cadastro
- Campo: Nome completo, E-mail, Senha, Confirmação de senha
- Botão: "Continuar com Google" (OAuth)
- Após cadastro: redireciona para onboarding (criação de primeira turma)

### T03 — Login
- Campo: E-mail + Senha
- Botão: "Entrar com Google"
- Link: "Esqueci minha senha" → fluxo de recuperação por e-mail

### T04 — Dashboard (Home)
- Cards resumo: Nº de turmas / Nº de provas / Última prova aplicada
- Atalhos rápidos: "Criar Prova" / "Ver Banco de Questões"
- Feed de atividade recente

### T05 — Banco de Questões (lista)
- Filtros: Disciplina / Tipo / Competência / Tag
- Cards de questões com preview do enunciado
- Botões: Visualizar / Editar / Adicionar à Prova / Excluir
- FAB (botão flutuante): "Nova Questão"

### T06 — Editor de Questão
- Toggle: [IA] / [Manual]
- **Modo IA:**
  - Formulário: tema, nível, habilidade, tipo de questão
  - Área de resultado com questão gerada
  - Botão: "Gerar outra" / "Aceitar e Editar"
- **Modo Manual:**
  - Campo: Texto-base (opcional, rico)
  - Campo: Enunciado (rich text)
  - Lista de alternativas (A–E) com radio "correta"
  - Toggle: Objetiva / Discursiva
- Tags: Disciplina, Competência, BNCC, Ano escolar
- Botão: "Salvar no Banco"

### T07 — Acervo Público
- Busca textual + Filtros combinados: Disciplina / Assunto / Banca / Nível / Ano
- Resultados em cards com preview
- Botão por card: "Adicionar ao Banco Pessoal" / "Adicionar à Prova Atual"

### T08 — Montagem do Caderno de Prova
- Painel esquerdo: fonte de questões (abas: Banco Pessoal / Acervo / Criar Nova)
- Painel direito: caderno em construção (drag-and-drop para reordenar)
- Campo de peso/pontuação por questão
- Barra de progresso: total de pontos

### T09 — Configurações de Exportação
- Campo: Cabeçalho institucional (nome da escola, professor, data, disciplina)
- Toggle: Incluir folha de respostas? (sim/não)
- Toggle: Incluir gabarito? (sim/não, somente para o professor)
- Seletor: Nº de versões anti-fraude (1, 2 ou 3 versões)
- Botões: "Baixar PDF" / "Baixar DOCX"

### T10 — Tabulação de Gabaritos
- Seletor de versão da prova (Tipo A / Tipo B...)
- Tabela: linha = aluno, colunas = questões
- Células clicáveis (A/B/C/D/E ou campo texto para discursiva)
- Botão: "Calcular Diagnóstico"

### T11 — Dashboard da Turma (Diagnóstico N1)
- Cabeçalho: nome da prova, turma, data, média geral
- Gráfico de barras: desempenho por questão
- Gráfico de pizza: distribuição de notas
- Heatmap: habilidades × desempenho
- Lista: alunos clicáveis (abre T12)
- Botão: "Enviar Feedback por E-mail"

### T12 — Perfil Individual do Aluno (Diagnóstico N2)
- Cabeçalho: nome do aluno, nota, posição na turma
- Lista de questões com: marcação do aluno / gabarito correto / status (✓ ou ✗)
- Mapa de habilidades: quais competências o aluno domina e quais precisa reforçar
- Histórico de provas anteriores (pequeno gráfico de linha)

### T13 — Histórico e Evolução Temporal (Diagnóstico N3)
- Seletor de turma
- Gráfico de linha: evolução da média por bimestre
- Tabela comparativa de provas
- Filtro: visão da turma vs. visão individual

### T14 — Gestão de Turmas
- Lista de turmas com: nome, ano, nº de alunos, nº de provas
- Botão: "Nova Turma"
- Por turma: editar / arquivar / ver alunos

### T15 — Detalhes da Turma
- Nome e dados da turma
- Lista de alunos (nome, e-mail, data de nascimento)
- Botão: "Importar Lista (CSV)"
- Botão: "Adicionar Aluno Manualmente"

### T16 — Configurações da Conta
- Editar nome e e-mail
- Trocar senha
- Preferências de notificação por e-mail
