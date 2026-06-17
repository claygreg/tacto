# Construindo Interfaces em Escala no Tacto

Este documento define as diretrizes e padrões arquiteturais para o desenvolvimento de interfaces no Tacto. O objetivo é garantir que o frontend permaneça escalável, consistente, de fácil manutenção e com excelente performance conforme o projeto cresce.

---

## 1. Design System e Componentes Base

O Tacto utiliza **shadcn/ui** em conjunto com **Tailwind CSS** para seus componentes base. 

### Regras de Ouro:
- **Priorize shadcn/ui:** Sempre que precisar de um componente básico (Botão, Input, Dialog, Select, etc.), utilize ou instale via CLI do shadcn (`npx shadcn@latest add [componente]`).
- **Evite re-inventar a roda:** Não crie componentes genéricos na pasta `components/common/` se eles puderem ser resolvidos com primitivos do shadcn ou utilitários do Tailwind.
- **Isolamento:** Componentes mais complexos e específicos do domínio (ex: `QuestionCard`) devem ser criados próximos de onde são usados ou em uma pasta `components/domain/` se forem amplamente compartilhados.

---

## 2. Tokens de Design e Cores (Tailwind + OKLCH)

As cores da aplicação são gerenciadas via CSS Variables usando o espaço de cor **OKLCH**, definidas em `src/app/globals.css` e consumidas pelo `tailwind.config.ts`.

### Como utilizar cores:
- **NÃO use cores literais (hardcoded)** como `bg-green-500` ou hex codes `#10b981` espalhados pelas páginas.
- **USE cores semânticas:**
  - `bg-primary`, `text-primary` (Ação principal)
  - `bg-destructive`, `text-destructive` (Ações perigosas)
  - `bg-success`, `text-success` (Sucesso, ex: status de "Aplicada")
  - `bg-warning`, `text-warning` (Alerta, ex: status "Pendente")
  - `bg-info`, `text-info` (Informativo, neutro)
  - `bg-muted`, `text-muted-foreground` (Fundos secundários, textos de apoio)

Isso garante que o Dark Mode funcione perfeitamente sem esforço adicional.

---

## 3. Dark Mode Persistente

O projeto utiliza `next-themes` para gerenciamento de tema.

- A classe `dark` é aplicada dinamicamente à tag HTML.
- **Nunca manipule o DOM manualmente** (`document.documentElement.classList.add`) para alterar o tema.
- Se precisar acessar o estado do tema em um Client Component, utilize o hook:
  ```tsx
  import { useTheme } from "next-themes";
  const { theme, setTheme, resolvedTheme } = useTheme();
  ```

---

## 4. Tipagem Estrita (TypeScript)

A regra `@typescript-eslint/no-explicit-any` está ativa como `warn`. O uso de `any` em escala destrói a confiança no código.

### Diretrizes:
- **Centralize as tipagens:** Defina interfaces que espelham os dados do backend e do negócio em `src/types/index.ts`.
- Tipos de domínio (ex: `Assessment`, `Classroom`, `DashboardSummary`) devem ser importados desse arquivo central.
- Se a API retornar um formato diferente, atualize os tipos e mapeie a resposta no fetcher/hook, não na página.

---

## 5. Data Fetching com SWR

Para Client Components, abandonamos o padrão ineficiente de `useEffect + fetch + setState`. Utilizamos **SWR** (`useSWR`).

### Por que SWR?
- Fornece cache, revalidação automática, tratamento de focus e elimina código boilerplate de estados de `loading`/`error`.

### Como usar:
Utilize o fetcher global configurado para lidar com erros não-2xx:
```tsx
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { MinhaInterface } from "@/types";

export default function MinhaPagina() {
  const { data, isLoading, error, mutate } = useSWR<MinhaInterface>("/api/meu-endpoint", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  // ...
}
```
- Para atualizar a interface após uma mutação (ex: criar uma nova turma), chame o método `mutate()` retornado pelo hook.

---

## 6. Padronização de Constantes e Lógica de UI

Não repita lógica de exibição em múltiplos arquivos. Use o arquivo `src/lib/constants.ts` como Fonte Única da Verdade para:

- **Mapeamentos de Status:** Dicionários que traduzem chaves para exibição (`draft` → "Rascunho").
- **Classes Condicionais:** Mapas de status para suas respectivas classes Tailwind semânticas.
- **Listas Fixas:** Filtros de disciplina, dificuldade, etc.
- **Paletas para Gráficos:** Cores de uso específico (ex: `PIE_CHART_PALETTE`) que precisam ser passadas programaticamente para bibliotecas (como o Recharts).

---

## 7. Responsividade e Layout

A aplicação Tacto é **Desktop-first** em sua concepção principal, visto que a maioria do uso será feito por professores em computadores. Contudo, ela **deve** seguir regras de responsividade para garantir um bom funcionamento em todos os cenários.

### Breakpoints e Diretrizes:
Ao construir interfaces, considere um bom comportamento adaptativo nos seguintes contextos:
- **Large Desk:** Telas muito grandes ou monitores externos (ex: `xl:` ou `2xl:` no Tailwind).
- **Small/Medium Desk:** Notebooks padrão, resolução comum (ex: `lg:`).
- **Tablet:** Uso em dispositivos médios e com touch (ex: `md:`).
- **Mobile:** Telas pequenas (tamanho base das classes do Tailwind, sem prefixo).

Embora a experiência primária seja no desktop, o uso do Tailwind exige que você pense progressivamente. Defina a estrutura base para o menor formato (ex: `grid-cols-1`) e utilize os breakpoints para ajustar os layouts maiores (ex: `md:grid-cols-2 lg:grid-cols-4`).

---

## 8. ESLint e Qualidade de Código

- Preste atenção aos avisos do ESLint no terminal ou na IDE.
- Evite desabilitar o ESLint linha a linha com `// eslint-disable-next-line`. Resolva a causa raiz.
- Dependências esquecidas em arrays do `useEffect` ou `useCallback` causarão bugs difíceis de rastrear. A regra `exhaustive-deps` aponta esses problemas.
