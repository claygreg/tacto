# Roadmap de Desenvolvimento — Tacto MVP

> Planejamento de entrega em fases, priorizando o que gera mais valor mais rápido.
> Estimativas baseadas em 1 desenvolvedor full-stack; ajustar conforme tamanho do time.

---

## Princípios de Priorização

1. **Sem fundação, nada funciona** → Autenticação e turmas vêm primeiro
2. **O loop principal é criar → exportar → diagnosticar** → entregar esse ciclo completo é o MVP real
3. **IA e Acervo Público são desejáveis, mas o valor central está no diagnóstico**
4. **Feedback por e-mail é a cereja do bolo** → vai por último, mas é diferencial

---

## Visão Geral das Fases

```
FASE 0       FASE 1         FASE 2          FASE 3          FASE 4
Estrutura    Criação        Exportação      Diagnóstico     Feedback
                                                            & Polish

─────────    ─────────      ─────────       ─────────       ─────────
Projeto      Banco de       Montagem        Tabulação       E-mail
Setup        Questões       da Prova        de Gabaritos    Automático

Auth         Editor IA      PDF / DOCX      Dashboard       Histórico
             + Manual       Anti-fraude     Turma           Temporal

Turmas       Banco          Configuração    Perfil          Ajustes
             Pessoal        de Cabeçalho    Individual      & QA

CSV          Acervo         (N/A)           (N/A)           Landing
Import       Público                                        Page

~2 semanas   ~3 semanas     ~2 semanas      ~3 semanas      ~2 semanas
```

**Estimativa total de MVP: ~12 semanas** (3 meses com 1 dev full-stack experiente)

---

## Fase 0 — Estrutura e Fundação (Semanas 1–2)

> **Objetivo:** Base técnica funcionando, professor consegue criar conta e cadastrar turmas.

### O que entregar:
- [ ] Configuração do projeto (repositório, CI/CD básico, ambientes dev/prod)
- [ ] Banco de dados modelado e migrations iniciais
- [ ] Autenticação completa (e-mail/senha + Google OAuth)
- [ ] Recuperação de senha por e-mail
- [ ] CRUD de Turmas (criar, editar, arquivar)
- [ ] Importação de alunos via CSV/Excel
- [ ] Tela de configurações da conta

### Resultado para o usuário:
> O professor cria sua conta, entra no sistema, cadastra suas turmas e importa a lista de chamada. O ambiente está pronto para receber avaliações.

---

## Fase 1 — Motor de Criação de Questões (Semanas 3–5)

> **Objetivo:** Professor consegue criar e organizar questões de forma completa.

### O que entregar:
- [ ] Editor de Questões — Modo Manual (objetiva e discursiva)
- [ ] Banco de Questões Pessoal (salvar, listar, filtrar, editar, excluir)
- [ ] Integração com API de IA para geração de questões (US 1.1)
- [ ] Revisão e edição das questões geradas pela IA (US 1.2)
- [ ] Busca no Acervo Público com filtros (US 1.5)

### Resultado para o usuário:
> O professor consegue popular seu banco com questões criadas manualmente, geradas pela IA ou buscadas no acervo. Ele tem um repositório organizado de itens avaliativos.

### Atenção:
- A integração com IA pode ter atraso dependendo do provedor escolhido (OpenAI, Gemini, etc.)
- O acervo público requer curadoria de dados ou integração com fonte externa — pode ser simplificado no MVP inicial

---

## Fase 2 — Montagem e Exportação da Prova (Semanas 6–7)

> **Objetivo:** Professor consegue montar uma prova e gerar o arquivo para impressão.

### O que entregar:
- [ ] Interface de montagem do caderno (arrastar questões, definir pesos)
- [ ] Geração de PDF formatado e pronto para impressão
- [ ] Geração de DOCX editável
- [ ] Configuração de cabeçalho institucional
- [ ] Geração de versões embaralhadas (anti-fraude) com gabaritos espelho

### Resultado para o usuário:
> O professor monta a prova, configura o cabeçalho e baixa o PDF ou Word. Pode gerar até 3 versões embaralhadas automaticamente. Está pronto para imprimir e aplicar.

### Atenção:
- A geração de PDF server-side requer biblioteca específica (Puppeteer ou similar) — planejar com antecedência
- O template visual da prova deve ser validado com um professor real antes de fechar

---

## Fase 3 — Tabulação e Diagnóstico (Semanas 8–10)

> **Objetivo:** O ciclo completo fecha — o professor aplica a prova, registra os resultados e vê o diagnóstico.

### O que entregar:
- [ ] Interface de tabulação de gabaritos (tabela aluno × questão)
- [ ] Suporte a múltiplas versões da prova na tabulação
- [ ] Motor de correção (cálculo de acertos, notas e % por habilidade)
- [ ] Dashboard da Turma — Diagnóstico Nível 1 (gráficos e heatmap)
- [ ] Perfil Individual do Aluno — Diagnóstico Nível 2
- [ ] Histórico Temporal — Diagnóstico Nível 3

### Resultado para o usuário:
> Após aplicar e corrigir a prova, o professor vê um painel completo: quais questões a turma errou mais, quais habilidades precisam de reforço e o desempenho de cada aluno individualmente. Consegue também comparar bimestres.

### Atenção:
- Os gráficos devem ser simples e interpretáveis — evitar sobrecarga de informação
- O Diagnóstico Nível 3 (histórico) depende de dados de múltiplas provas — pode ser liberado só após a 2ª prova ser registrada

---

## Fase 4 — Feedback Automático e Polimento (Semanas 11–12)

> **Objetivo:** Fechar o produto com o diferencial do e-mail automático e preparar para os primeiros usuários reais.

### O que entregar:
- [ ] Disparo de e-mail de feedback individual por aluno (com fila de envio)
- [ ] Template de e-mail de feedback (nota, acertos, mensagem motivacional)
- [ ] Landing Page pública (apresentação do produto, CTA de cadastro)
- [ ] Onboarding simplificado para novos usuários (tour guiado ou checklist)
- [ ] Testes de carga e segurança básica (antes de lançar)
- [ ] Ajustes de UX com base em feedback de usuários beta
- [ ] Documentação básica de uso (FAQ / vídeo curto)

### Resultado para o usuário:
> Com um clique, todos os alunos recebem seu relatório personalizado por e-mail. O produto está polido, com Landing Page e pronto para crescer.

---

## Marcos de Entrega (Milestones)

| Marco | Fase | Entrega |
|---|---|---|
| **M1 — Alpha Fechado** | Fim da Fase 0 | Acesso restrito: conta, login, turmas, importação de alunos |
| **M2 — Alpha com Criação** | Fim da Fase 1 | Banco de questões completo, editor com IA |
| **M3 — MVP Funcional** | Fim da Fase 2 | Loop completo: criar → montar → exportar → imprimir |
| **M4 — MVP com Diagnóstico** | Fim da Fase 3 | Loop completo com tabulação e dashboards |
| **M5 — MVP Lançável** | Fim da Fase 4 | E-mail automático, landing page, pronto para usuários reais |

---

## O que vem depois do MVP (Roadmap Futuro)

| Funcionalidade | Motivo de estar fora do MVP |
|---|---|
| Portal do Aluno (resposta online) | Complexidade técnica e custo; prioridade no diagnóstico primeiro |
| App Mobile | Requer MVP web validado antes |
| Integração com sistemas escolares (SIGA, SEE) | Dependência de terceiros e APIs proprietárias |
| Gestão por escola (múltiplos professores, diretor) | Requer modelo multi-tenant mais complexo |
| Correção automática de discursivas com IA | Tecnologia ainda em maturação para português pedagógico |
| Banco de questões colaborativo (entre professores) | Requer moderação e curadoria de conteúdo |
| Relatório exportável (PDF de diagnóstico) | Nice-to-have; priorizar a visão em tela primeiro |
