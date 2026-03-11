# OSSI 2.0 Frontend

React + TypeScript + Vite frontend for OSSI 2.0.

## Prerequisites

- Node.js 22 (or newer)
- npm
- Docker Desktop (optional, for containerized dev)
- Running backend (`ossi-api`) at `http://localhost:3000`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```env
VITE_CLIENT_ID=your-azure-app-client-id
VITE_TENANT_ID=your-azure-tenant-id
VITE_REDIRECT_URI=http://localhost:5174/
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5174/
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

3. Start dev server:

```bash
npm run dev
```

4. Open [http://localhost:5174](http://localhost:5174)

## Scripts

- `npm run dev` starts local Vite dev server (`5174`)
- `npm run build` runs type-check build and creates production bundle
- `npm run preview` serves built app locally
- `npm run lint` runs ESLint

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_CLIENT_ID` | Yes | Azure AD application client id used by MSAL |
| `VITE_TENANT_ID` | Yes | Azure AD tenant id |
| `VITE_REDIRECT_URI` | Yes | Redirect URI after login |
| `VITE_POST_LOGOUT_REDIRECT_URI` | Yes | Redirect URI after logout |
| `VITE_GRAPHQL_URL` | No | GraphQL endpoint URL. Default is `/graphql` |

If any required MSAL variable is missing, the app throws at startup (`authConfig.ts`).

## Authentication and Roles

- Authentication is handled with MSAL (`@azure/msal-browser`, `@azure/msal-react`).
- Backend login is completed with `LOGIN_MUTATION` that exchanges id token for backend token.
- Role is inferred from email domain in `src/components/auth-provider.tsx`:
  - `@esedulainen.fi` => `student`
  - `@esedu.fi` => `teacher`
- In local development (`import.meta.env.DEV`), role can be switched from avatar menu in UI (`Vaihda roolia`).

## API Integration

- GraphQL client is configured in `src/graphql/apolloClient.ts`.
- GraphQL endpoint comes from `VITE_GRAPHQL_URL` (fallback `/graphql`).
- Backend auth token is sent in `Authorization` header from `sessionStorage.mutatedToken`.

## Docker (Dev)

Use compose file for local containerized frontend:

```bash
docker compose -f compose.dev.yml up --build
```

The app is available at `http://localhost:5174`.

## Project Structure

See detailed documentation:

- [docs/frontend-architecture.md](/Users/purot/ossi/ossi2.0-front/docs/frontend-architecture.md)
- [docs/deploy.md](/Users/purot/ossi/ossi2.0-front/docs/deploy.md)

## Troubleshooting

- `Missing environment variables for MSAL configuration`:
  - Verify `.env` exists and all four `VITE_*` variables are set.
- Redirect/auth loops:
  - Clear browser session storage and retry login.
- No data from backend:
  - Confirm `ossi-api` is running at `http://localhost:3000`.
