# Authentication Flow

This document describes how authentication currently works in OSSI 2.0 frontend when signing in through Azure AD and then exchanging the Azure token for a backend token.

## Scope

This document covers:

- Azure AD login redirect flow
- frontend MSAL initialization
- backend token exchange with `LOGIN_MUTATION`
- how authenticated GraphQL traffic is authorized
- logout flow
- runtime data stored in `sessionStorage`

Main files:

- [authConfig.ts](/Users/purot/ossi/ossi2.0-front/authConfig.ts)
- [src/components/Login.tsx](/Users/purot/ossi/ossi2.0-front/src/components/Login.tsx)
- [src/components/auth-provider.tsx](/Users/purot/ossi/ossi2.0-front/src/components/auth-provider.tsx)
- [src/utils/auth-utils.ts](/Users/purot/ossi/ossi2.0-front/src/utils/auth-utils.ts)
- [src/graphql/LoginMutation.tsx](/Users/purot/ossi/ossi2.0-front/src/graphql/LoginMutation.tsx)
- [src/graphql/apolloClient.ts](/Users/purot/ossi/ossi2.0-front/src/graphql/apolloClient.ts)
- [src/components/layout/user-nav.tsx](/Users/purot/ossi/ossi2.0-front/src/components/layout/user-nav.tsx)

## High-Level Summary

Authentication happens in two stages:

1. The user signs in with Azure AD through MSAL.
2. The frontend sends the Azure `idToken` to the backend using `LOGIN_MUTATION`, and the backend returns its own token.

The application does not use the Azure `idToken` directly for normal GraphQL traffic. Instead, the backend-issued token is stored in `sessionStorage` as `mutatedToken` and attached to GraphQL requests in the `Authorization` header.

## Components And Responsibilities

### `authConfig.ts`

Defines the MSAL configuration:

- Azure client id
- tenant id
- redirect URIs
- cache location
- requested scopes for login

MSAL cache is configured to use `sessionStorage`.

### `Login.tsx`

Shows the login button and starts the Azure login redirect flow:

```ts
instance.loginRedirect(loginRequest);
```

### `auth-utils.ts`

Creates the shared `msalInstance` and registers an MSAL event callback.

The callback currently:

- listens for `LOGIN_SUCCESS`
- sets the active account
- updates the user email in frontend state

Important:
The event callback does not complete backend authentication by itself. The backend token exchange is handled in `AuthProvider`.

### `auth-provider.tsx`

This is the main authentication coordinator. It:

- initializes MSAL
- handles the Azure redirect response
- extracts the Azure `idToken`
- sends the `idToken` to backend using `LOGIN_MUTATION`
- stores the backend token in `sessionStorage`
- marks the user authenticated only after backend login succeeds
- derives role from email domain

### `LoginMutation.tsx`

Defines:

```graphql
mutation Login($idToken: String!) {
  login(idToken: $idToken) {
    message
    status
    success
    token
  }
}
```

### `apolloClient.ts`

Reads `sessionStorage.mutatedToken` and injects it into every GraphQL request:

```ts
Authorization: token ? token : ''
```

### `user-nav.tsx`

Handles logout by:

1. clearing `sessionStorage`
2. calling `instance.logoutRedirect()`

## Successful Login Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Login as Login.tsx
    participant MSAL as MsalProvider / msalInstance
    participant Azure as Azure AD
    participant Auth as AuthProvider
    participant GQL as Apollo Client
    participant API as Backend GraphQL API
    participant Store as sessionStorage

    User->>Login: Click "Kirjaudu sisään"
    Login->>MSAL: loginRedirect(loginRequest)
    MSAL->>Azure: Redirect user to Microsoft login
    User->>Azure: Enter credentials
    Azure-->>MSAL: Redirect back to frontend

    Auth->>MSAL: initialize()
    Auth->>MSAL: handleRedirectPromise()
    MSAL-->>Auth: redirectResponse(account, idToken)

    Auth->>MSAL: setActiveAccount(account)
    Auth->>Store: save ossi.email
    Auth->>Auth: derive role from email domain
    Auth->>Store: save ossi.role

    Auth->>GQL: LOGIN_MUTATION(idToken)
    GQL->>API: login(idToken)
    API-->>GQL: backend token
    GQL-->>Auth: login response

    Auth->>Store: save mutatedToken
    Auth->>Store: save ossi.authenticated=true
    Auth->>Auth: setIsAuthenticated(true)

    User->>GQL: Use protected frontend views
    GQL->>Store: read mutatedToken
    GQL->>API: Authorization: mutatedToken
    API-->>GQL: protected data
```

## Failed Login Sequence

This sequence covers the case where Azure login succeeds, but backend token exchange fails.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Azure as Azure AD
    participant Auth as AuthProvider
    participant GQL as Apollo Client
    participant API as Backend GraphQL API
    participant Store as sessionStorage

    Azure-->>Auth: redirectResponse(account, idToken)
    Auth->>Store: save ossi.email
    Auth->>Store: save derived ossi.role

    Auth->>GQL: LOGIN_MUTATION(idToken)
    GQL->>API: login(idToken)
    API-->>GQL: error or no token
    GQL-->>Auth: failed response

    Auth->>Auth: sendIdTokenToBackend() returns false
    Auth->>Auth: do not set isAuthenticated=true
    Auth->>Store: mutatedToken is not saved
    Auth->>Store: ossi.authenticated remains unset or false
```

## Logout Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Nav as user-nav.tsx
    participant Store as sessionStorage
    participant MSAL as Msal instance
    participant Azure as Azure AD

    User->>Nav: Click "Kirjaudu ulos"
    Nav->>Store: sessionStorage.clear()
    Nav->>MSAL: logoutRedirect()
    MSAL->>Azure: Start Azure logout
    Azure-->>MSAL: Redirect back to app
```

## Data Flow

```mermaid
flowchart TD
    A["User clicks login button"] --> B["Login.tsx: loginRedirect(loginRequest)"]
    B --> C["Azure AD login"]
    C --> D["Redirect back to frontend"]
    D --> E["AuthProvider initializes MSAL"]
    E --> F["handleRedirectPromise()"]

    F --> G["MSAL redirectResponse"]
    G --> H["Extract account.username"]
    H --> I["Save ossi.email in sessionStorage"]
    H --> J["Derive role from email domain"]
    J --> K["Save ossi.role in sessionStorage"]

    G --> L["Extract Azure idToken"]
    L --> M["LOGIN_MUTATION(idToken)"]
    M --> N["Backend validates Azure token"]
    N --> O["Backend returns backend token"]
    O --> P["Save mutatedToken in sessionStorage"]
    P --> Q["Set ossi.authenticated=true"]

    Q --> R["Apollo Client reads mutatedToken"]
    R --> S["Authorization header for GraphQL requests"]
    S --> T["Protected backend queries and mutations"]
```

## Runtime Storage

The following keys are used in `sessionStorage`:

- `ossi.authenticated`
  - stringified boolean
  - set to `true` only after backend token exchange succeeds
- `ossi.email`
  - Azure account username/email
- `ossi.role`
  - stringified role derived from email domain or manually overridden in development
- `mutatedToken`
  - backend-issued token used for GraphQL authorization

## Role Derivation

Role is derived in frontend from email domain:

- `@esedulainen.fi` -> `student`
- `@esedu.fi` -> `teacher`
- otherwise -> `unknown`

This happens in `AuthProvider` after `userEmail` is known.

In development, role can also be manually changed from the user menu.

## Important Implementation Notes

### Authentication is not complete at Azure redirect alone

The user may successfully sign in with Azure, but the frontend only treats the user as authenticated after backend login succeeds and `mutatedToken` is stored.

### MSAL event callback is supportive, not authoritative

`handleMsalEventCallback()` updates the active account and email on `LOGIN_SUCCESS`, but the authoritative login completion still happens in `AuthProvider` through:

1. `handleRedirectPromise()`
2. `LOGIN_MUTATION`
3. backend token storage

### GraphQL traffic uses backend token, not raw Azure token

Normal application requests do not use the Azure `idToken` directly. The `idToken` is only used once for backend login exchange.

### Logout clears local frontend auth state first

`user-nav.tsx` clears `sessionStorage` before redirecting to Azure logout. This means:

- local auth state is removed immediately
- backend token is discarded immediately
- Azure session is ended through `logoutRedirect()`

## Current Limitations And Risks

- `idToken` is currently logged to console in `auth-provider.tsx` for testing and should be removed in production-safe code.
- Role derivation is frontend domain-based, so it depends on email naming conventions.
- `sessionStorage` means auth state is tab-scoped and cleared when the browser session ends.

## Suggested Follow-Up Improvements

1. Remove the temporary `console.log(idToken)` from `auth-provider.tsx`.
2. Document backend-side `login(idToken)` validation separately.
3. Add a small auth state diagram for `unknown -> redirect pending -> backend authenticated`.
4. Add explicit error UI for backend login failures after Azure redirect succeeds.
