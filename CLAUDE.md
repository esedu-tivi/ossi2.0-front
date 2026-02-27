# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ossi 2.0 is a Finnish vocational education management platform (React + TypeScript) for managing student projects, internships, workplaces, and qualification units. Two user roles: **teacher** (`@esedu.fi` email) and **student** (`@esedulainen.fi` email).

## Commands

- `npm run dev` — Start Vite dev server on port 5174
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — ESLint (flat config, typescript-eslint)
- `npm run test` — Run all tests (Vitest)
- `npx vitest path/to/test.tsx` — Run a single test file
- `npx vitest --run` — Run tests once (no watch mode)
- `docker compose -f compose.dev.yml up --build` — Run in Docker (dev mode)

## Architecture

### Tech Stack
- **React 18** with **TypeScript**, bundled by **Vite**
- **Apollo Client** + **GraphQL** for API communication (backend at `localhost:3000/graphql`)
- **shadcn/ui** (new-york style) + **Radix UI** primitives + **Tailwind CSS v4** for UI
- **Azure MSAL** for authentication (Microsoft Entra ID / Azure AD)
- **Plate.js** for rich text editing (`src/components/common/plate-editor.tsx`)
- **React Router v6** for routing
- **Vitest** + **React Testing Library** + **jsdom** for testing
- **Sonner** for toast notifications

### Path Alias
`@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`). Always use `@/` imports.

### Provider Hierarchy (main.tsx)
`ApolloProvider` → `AuthProvider` → `BrowserRouter` → `AlertContextProvider` → `App`

### Authentication Flow
1. `authConfig.ts` — MSAL configuration (reads `VITE_CLIENT_ID`, `VITE_TENANT_ID`, `VITE_REDIRECT_URI`, `VITE_POST_LOGOUT_REDIRECT_URI` from env)
2. `src/utils/auth-utils.ts` — Creates MSAL instance and event callbacks
3. `src/components/auth-provider.tsx` — `AuthProvider` manages auth state, sends idToken to backend via `LOGIN_MUTATION`, stores JWT in `sessionStorage("mutatedToken")`
4. `src/utils/auth-context.ts` — `useAuth()` hook exposes `isAuthenticated`, `userEmail`, `role`
5. `src/ProtectedRoute.tsx` — Route guard with role-based access (`allowedRoles` prop)
6. Apollo Client (`src/graphql/apolloClient.ts`) attaches the JWT from `sessionStorage("mutatedToken")` to every GraphQL request

### Key Patterns

- **GraphQL operations**: individual files in `src/graphql/` (one file per query/mutation), not colocated with components
- **Route components**: `src/components/Routes/`; wrapped with `AppLayout` and `ProtectedRoute` in `App.tsx`
- **Layout**: `src/components/layout/` — sidebar-based layout using shadcn `SidebarProvider` (`app-layout.tsx`, `app-sidebar.tsx`, `app-header.tsx`)
- **Reusable components**: `src/components/common/` — app-level wrappers (combobox, data-table, chip-selector, app-dialog, plate-editor, etc.)
- **UI primitives**: `src/components/ui/` — shadcn/ui components (do not edit directly; regenerate with `npx shadcn@latest add <component>`)
- **Styling**: Tailwind CSS v4 with oklch design tokens defined in `src/app.css`. Use the `cn()` utility from `@/lib/utils` for conditional classes.
- **Alerts/Toasts**: `useAlerts()` from `src/context/AlertContext.tsx` — call `addAlert(message, severity)`. Backed by Sonner.
- **Confirm dialogs**: `useConfirmDialog()` hook from `src/hooks/useConfirmDialog.tsx` — returns `{ confirm, ConfirmDialog }`. Promise-based.
- **Form state**: `useFormHandleManager` hook in `src/hooks/` manages complex project/part form state with linked selector fields
- **Types**: shared type definitions in `src/types.ts` and `src/FormData.tsx`

### Testing
- Config: `vitest.config.ts` with setup file at `src/test/setup.ts`
- Tests live in `__tests__/` directories next to the code they test
- Setup file polyfills `matchMedia`, `ResizeObserver`, `scrollIntoView`, pointer capture, and `getSelection` for jsdom compatibility with Radix/cmdk/Plate

### UI Language
The application UI is in **Finnish**. Keep all user-facing strings in Finnish.

### Environment Variables
Required in `.env`:
```
VITE_CLIENT_ID=
VITE_TENANT_ID=
VITE_REDIRECT_URI=http://localhost:5174/
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5174/
```

### Backend Dependency
This frontend requires the companion **Ossi-Api** backend running on `localhost:3000`. The GraphQL endpoint is hardcoded in `src/graphql/apolloClient.ts`.
