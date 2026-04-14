# Frontend Architecture

This document describes the current frontend structure and key runtime flows.

## Tech Stack

- React 18 + TypeScript
- Vite 5
- React Router 6
- Apollo Client (GraphQL)
- MUI 6
- MSAL (Azure AD authentication)

## Bootstrapping Flow

Entry point: `src/main.tsx`

Provider tree:

1. `ApolloProvider` (GraphQL client)
2. `AuthProvider` (authentication state, role, backend token exchange)
3. `BrowserRouter` (routing)
4. `ConfirmProvider` (dialog confirmations)
5. `AlertContextProvider` + `AlertContainer` (global alert UI)
6. `App`

## Authentication Flow

Main files:

- `authConfig.ts`
- `src/utils/auth-utils.ts`
- `src/components/auth-provider.tsx`
- `src/ProtectedRoute.tsx`

Flow:

1. MSAL handles login redirect and active account.
2. `AuthProvider` reads authenticated user email.
3. `LOGIN_MUTATION` exchanges MSAL id token for backend token.
4. Backend token is stored in `sessionStorage` as `mutatedToken`.
5. Apollo adds token to `Authorization` header.
6. Protected routes verify auth state and allowed roles.

## Routing Model

Routing is defined in `src/App.tsx`.

Public:

- `/` -> login page

Protected (examples):

- `/studentdashboard`
- `/studentdashboard/newuserlogin`
- `/teacherdashboard`
- `/teacherprojects`
- `/qualificationunitparts`
- `/workplaces`

Teacher-only routes use `allowedRoles={["teacher"]}` in `ProtectedRoute`.

## Post-login Redirect Logic

`src/App.tsx` applies role-aware redirect rules once setup data is loaded:

- Teacher defaults to `/teacherdashboard`
- Student without setup defaults to `/studentdashboard/newuserlogin`
- Student with setup defaults to `/studentdashboard`

User setup state is fetched with GraphQL query `USER_SETUP`.

## Directory Overview

- `src/components/Routes/` route-level screens
- `src/components/common/` reusable UI components
- `src/graphql/` GraphQL queries and mutations
- `src/context/` React context providers
- `src/hooks/` custom React hooks
- `src/utils/` auth and utility helpers
- `src/styles/` style objects
- `src/css/` CSS modules/files

## Known Constraints

- GraphQL endpoint comes from `VITE_GRAPHQL_URL` with fallback `/graphql`.
- Role assignment is domain-based in frontend (`@esedu.fi`, `@esedulainen.fi`).
- Auth and API tokens are stored in `sessionStorage`.

## Suggested Next Documentation Additions

1. Page-by-page route ownership and business purpose table.
2. GraphQL operation map: operation -> consumer component.
3. UI state conventions (loading/error/empty handling patterns).
