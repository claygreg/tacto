# Tacto — Premium Frontend Starter Template

Tacto is a cleanly-structured, highly scalable, and performant Next.js 14 frontend-only boilerplate designed for rapid UI and component building.

## 🚀 Features

- **Next.js 14** (App Router)
- **TypeScript** (Strict compiler mode configuration)
- **Tailwind CSS** (Utility-first styling ready out-of-the-box)
- **Path Aliases** (Clean imports via `@/*` pointing to `src/*`)
- **Helper Utilities** (Standardized `cn(...)` using `clsx` and `tailwind-merge`)
- **Linting & Formatting** (Integrated ESLint + Prettier configuration)
- **Modular Directory Structure**:
  - `src/app/` — Pages and layout structure
  - `src/components/common/` — Reusable elements (Button, Input, Card)
  - `src/components/layout/` — Layout structures (Header, Sidebar, Footer)
  - `src/components/features/` — Feature-based modules
  - `src/lib/` — Shared libraries and utilities
  - `src/types/` — Shared TypeScript type declarations
  - `src/hooks/` — Custom React hooks

---

## 🛠️ Getting Started

### 1. Installation

First, clone this repository and install the dependencies:

```bash
npm install
```

### 2. Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the live application.

### 3. Linting and Formatting

Check for linting errors:

```bash
npm run lint
```

Format code according to Prettier guidelines:

```bash
npx prettier --write .
```

---

## 📂 Folder Structure

```text
Tacto/
├── src/
│   ├── app/                 # App Router (layouts, pages, globals.css)
│   ├── components/
│   │   ├── common/          # Low-level atoms (Button, Input, Card)
│   │   ├── layout/          # Layout blocks (Header, Sidebar, Footer)
│   │   └── features/        # High-level feature-specific components
│   ├── lib/                 # Shared logic & helper utilities (utils.ts)
│   ├── types/               # TypeScript type annotations
│   └── hooks/               # Custom reusable React hooks
├── public/                  # Static assets
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Standard Git ignore file
├── .prettierrc              # Prettier format rules
├── next.config.mjs          # Next.js configurations
├── tailwind.config.ts       # Tailwind CSS setup
├── tsconfig.json            # Strict TypeScript rules
└── package.json             # Scripts & dependencies
```
