# Requisitos Técnicos — Tacto MVP

> Documento técnico para desenvolvedores. Define stack, banco de dados, integrações e decisões de arquitetura.

---

## Stack Recomendada

### Frontend
| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | **Next.js 14+** (App Router) | SSR/SSG nativo, rotas, otimizações de performance |
| Linguagem | **TypeScript** | Tipagem estática reduz bugs em projeto de média complexidade |
| Estilização | **Tailwind CSS + shadcn/ui** | Design system produtivo com componentes acessíveis |
| Gráficos | **Recharts** ou **Nivo** | Biblioteca React-native, leve, responsiva |
| Editor Rich Text | **Tiptap** | Editor modular baseado em ProseMirror, customizável |
| Drag-and-Drop | **@dnd-kit** | Acessível, flexível, funciona bem no Next.js |
| Formulários | **React Hook Form + Zod** | Validação declarativa, performática |
| Estado global | **Zustand** ou **React Query (TanStack)** | Zustand para UI state; React Query para cache de server data |
| Upload de arquivos | **React Dropzone** | Simples, acessível |

### Backend
| Camada | Tecnologia | Justificativa |
|---|---|---|
| Runtime | **Node.js** | Ecossistema maduro, mesma linguagem que o frontend |
| Framework | **NestJS** | Estrutura modular, decorators, DI — escala bem conforme projeto cresce |
| Linguagem | **TypeScript** | Consistência com o frontend |
| ORM | **Prisma** | Type-safe, migrations automáticas, ótima DX |
| Autenticação | **Auth.js (NextAuth)** ou **Lucia** | OAuth Google nativo, sessões seguras |
| Filas | **BullMQ** (Redis) | Para envio de e-mails em background sem bloquear a resposta |
| Geração de PDF | **Puppeteer** ou **Playwright** | Renderiza HTML → PDF com fidelidade visual |
| Geração de DOCX | **docx** (npm) ou **officegen** | Geração programática de arquivos Word |

> **Alternativa simplificada:** Se o time for pequeno, usar Next.js com Route Handlers (API Routes) no lugar de NestJS separado. Reduz complexidade de deploy.

### Banco de Dados
| Tecnologia | Justificativa |
|---|---|
| **PostgreSQL** | Relacional, robusto, excelente suporte a JSON (para dados de questões), open-source |
| **Redis** | Cache de sessões, filas BullMQ para e-mails |

### Infra e Deploy
| Camada | Tecnologia | Justificativa |
|---|---|---|
| Hospedagem Frontend | **Vercel** | Deploy automático, integração nativa com Next.js |
| Hospedagem Backend | **Railway** ou **Render** | Node.js containers gerenciados, fácil de configurar |
| Banco de Dados | **Supabase** (PostgreSQL gerenciado) ou **Neon** | Gratuito no início, escala conforme necessário |
| Redis | **Upstash** | Redis serverless, generoso plano gratuito |
| E-mail | **Resend** ou **SendGrid** | APIs modernas de envio transacional |
| Storage (arquivos) | **AWS S3** ou **Cloudflare R2** | Para PDFs gerados e uploads de CSV |
| Monitoramento | **Sentry** | Rastreamento de erros frontend + backend |

---

## Modelagem do Banco de Dados

### Diagrama Entidade-Relacionamento (simplificado)

```
User (Professor)
  ├── id, email, name, passwordHash, provider (email|google)
  ├── createdAt, updatedAt
  │
  ├──< Classroom (Turma)
  │     ├── id, name, year, subject, archived
  │     ├── userId (FK)
  │     │
  │     └──< Student (Aluno)
  │           ├── id, fullName, email, birthDate
  │           └── classroomId (FK)
  │
  ├──< Question (Questão)
  │     ├── id, type (multiple_choice | discursive), body, baseText
  │     ├── discipline, tags[], bnccCode, yearLevel, difficulty
  │     ├── source (personal | public | ai_generated)
  │     ├── userId (FK — null se acervo público)
  │     │
  │     └──< QuestionOption (Alternativa)
  │           ├── id, label (A/B/C/D/E), text, isCorrect
  │           └── questionId (FK)
  │
  └──< Assessment (Prova)
        ├── id, name, classroomId (FK), userId (FK)
        ├── createdAt, appliedAt
        │
        ├──< AssessmentItem (Questão na Prova)
        │     ├── id, assessmentId (FK), questionId (FK)
        │     ├── order, weight/points
        │     └── versionShuffle (JSON — mapas de versões A/B/C)
        │
        └──< AssessmentResponse (Tabulação por Aluno)
              ├── id, assessmentId (FK), studentId (FK)
              ├── version (A|B|C), totalScore, appliedAt
              │
              └──< ResponseItem (Resposta por Questão)
                    ├── id, assessmentResponseId (FK), assessmentItemId (FK)
                    ├── selectedOption, isCorrect, scoreObtained
                    └── (discursiva: manualScore)
```

---

## APIs e Integrações Externas

### 1. Geração de Questões com IA

**Provedor recomendado:** OpenAI (GPT-4o) ou Google Gemini

**Endpoint interno:** `POST /api/questions/generate`

**Payload enviado para a IA:**
```json
{
  "subject": "Biologia",
  "topic": "Mitose e Meiose",
  "yearLevel": "9º Ano",
  "bnccCode": "EF09CI07",
  "type": "multiple_choice",
  "alternatives": 5,
  "difficulty": "medium"
}
```

**Prompt estruturado (system prompt):**
> "Você é um especialista em educação básica brasileira. Crie uma questão de múltipla escolha com 5 alternativas, texto-base quando pertinente, seguindo os parâmetros fornecidos. Retorne em JSON estruturado."

**Resposta esperada (JSON):**
```json
{
  "baseText": "...",
  "body": "Considerando o processo de...",
  "options": [
    { "label": "A", "text": "...", "isCorrect": false },
    { "label": "B", "text": "...", "isCorrect": true },
    ...
  ],
  "explanation": "A alternativa correta é B porque..."
}
```

**Timeout:** 30s. Retry 1x em caso de falha. Erro amigável no frontend.

---

### 2. Envio de E-mails

**Provedor recomendado:** Resend

**Endpoint interno:** `POST /api/emails/send-feedback` (via fila BullMQ)

**Fluxo:**
1. Professor clica em "Enviar Feedback"
2. Backend cria jobs na fila (1 job por aluno)
3. Worker processa em lote (10 e-mails/minuto para evitar spam)
4. Professor recebe e-mail de resumo ao final

**Template de e-mail do aluno:**
- Assunto: `Seu desempenho em [Nome da Prova] - [Disciplina]`
- Conteúdo: nome do aluno, nota, % de acerto, lista de questões (status ✓/✗), mensagem do professor (se configurada)
- HTML responsivo

---

### 3. Acervo Público de Questões

**Abordagem no MVP:** Base local curada (PostgreSQL), importada manualmente ou via scraping pré-autorizado de fontes como ENEM, Saeb, bancas estaduais.

**Endpoints internos:**
- `GET /api/questions/public?subject=&topic=&year=&source=` — busca com filtros
- `POST /api/questions/public/:id/copy` — copia para banco pessoal do professor

**Indexação:** Elasticsearch ou busca full-text nativa do PostgreSQL (`tsvector`) no MVP.

---

### 4. Geração de PDF

**Tecnologia:** Puppeteer (headless Chrome)

**Fluxo:**
1. Frontend envia configurações da prova para `POST /api/assessments/:id/export`
2. Backend renderiza HTML do template da prova
3. Puppeteer converte HTML → PDF
4. PDF salvo em S3/R2 com link temporário (15min de validade)
5. Frontend recebe URL e inicia download

**Templates de prova:** Handlebars ou JSX (React renderizado server-side)

**Versões anti-fraude:** Backend shuffla questões e alternativas, gera N PDFs, compacta em `.zip`.

---

## Autenticação e Segurança

| Aspecto | Implementação |
|---|---|
| **Sessões** | JWT com refresh token (access: 15min, refresh: 7 dias) |
| **OAuth Google** | OAuth 2.0 via Auth.js |
| **Senhas** | Hash com bcrypt (rounds: 12) |
| **CORS** | Whitelist de origens (apenas domínio da aplicação) |
| **Rate Limiting** | 100 req/min por IP em rotas públicas; 30 req/min em `/api/questions/generate` |
| **Validação** | Zod em todas as entradas de API (body, query params) |
| **SQL Injection** | Prevenido pelo Prisma (queries parametrizadas) |
| **XSS** | Next.js escapa por padrão; Tiptap com sanitização configurada |
| **HTTPS** | Obrigatório em produção (Vercel/Railway já provêm) |
| **Dados dos alunos** | Não coletar mais do que nome, e-mail e nascimento (LGPD) |

---

## Estrutura de Pastas do Projeto

```
tacto/
├── apps/
│   ├── web/                    # Next.js (frontend)
│   │   ├── app/               # App Router
│   │   │   ├── (auth)/        # Rotas públicas (login, cadastro)
│   │   │   ├── (app)/         # Rotas autenticadas
│   │   │   │   ├── dashboard/
│   │   │   │   ├── questoes/
│   │   │   │   ├── provas/
│   │   │   │   ├── diagnostico/
│   │   │   │   └── turmas/
│   │   │   └── api/           # Route Handlers (se monolito)
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── ui/            # shadcn/ui base
│   │   │   ├── questions/     # Editor, cards de questão
│   │   │   ├── assessments/   # Montagem, exportação
│   │   │   └── diagnostics/   # Gráficos, perfis
│   │   └── lib/               # Utilitários, hooks, API client
│   │
│   └── api/                   # NestJS (se backend separado)
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── classrooms/
│       │   ├── students/
│       │   ├── questions/
│       │   ├── assessments/
│       │   ├── diagnostics/
│       │   ├── emails/
│       │   └── exports/       # PDF, DOCX
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── types/                 # Tipos TypeScript compartilhados
│   ├── validators/            # Schemas Zod compartilhados
│   └── email-templates/       # Templates HTML de e-mail
│
└── .utils/                    # Documentação do projeto
```

---

## Performance e Escalabilidade

| Área | Estratégia no MVP |
|---|---|
| **Geração de PDF** | Processamento assíncrono + polling no frontend (evita timeout HTTP) |
| **Envio de e-mails** | Fila BullMQ — nunca síncrono |
| **Busca no acervo** | Full-text search PostgreSQL (`tsvector`) — suficiente até 100k questões |
| **Dashboard de diagnóstico** | Dados calculados e cacheados ao confirmar tabulação (não on-the-fly) |
| **Uploads CSV** | Processamento assíncrono para arquivos > 100 linhas |
| **Imagens** | Next.js Image optimization para assets estáticos |

---

## Variáveis de Ambiente (`.env`)

```bash
# Banco de Dados
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://app.tacto.com.br
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# IA
OPENAI_API_KEY=...              # ou GEMINI_API_KEY
AI_MODEL=gpt-4o-mini            # modelo padrão (custo/qualidade)

# E-mail
RESEND_API_KEY=...
EMAIL_FROM=noreply@tacto.com.br

# Storage
S3_BUCKET=tacto-exports
S3_REGION=sa-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# Sentry
SENTRY_DSN=...

# App
NEXT_PUBLIC_APP_URL=https://app.tacto.com.br
NODE_ENV=production
```

---

## Estimativa de Custos (MVP — primeiros 6 meses)

| Serviço | Plano inicial | Custo estimado/mês |
|---|---|---|
| Vercel (frontend) | Hobby/Pro | R$ 0–50 |
| Railway (backend) | Starter | R$ 25–100 |
| Supabase (PostgreSQL) | Free/Pro | R$ 0–125 |
| Upstash (Redis) | Free | R$ 0 |
| OpenAI API | Pay-per-use | R$ 50–300 (depende do volume) |
| Resend (e-mails) | Free (3k/mês) | R$ 0–50 |
| Cloudflare R2 (storage) | Free (10GB) | R$ 0 |
| Sentry | Developer (free) | R$ 0 |
| **Total estimado** | | **R$ 75–625/mês** |

> Custos aumentam com crescimento de usuários. Planejar migração para planos pagos após primeiros 100 professores ativos.
