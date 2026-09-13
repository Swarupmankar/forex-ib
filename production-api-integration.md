# Production API Integration — Frontend Agent Task

You are working on my existing frontend dashboard application.

Your task is to implement a **production-grade, optimized API integration and authentication architecture** into the existing frontend.

## IMPORTANT

Before making any changes:

1. Inspect the complete existing frontend structure.
2. Identify:
   - Framework and version
   - TypeScript/JavaScript usage
   - Existing API/request utilities
   - Existing Axios/fetch implementation
   - Existing authentication logic
   - Existing Zustand/Redux/context/state management
   - Existing TanStack Query/React Query setup
   - Existing routing/protected routes
   - Existing storage implementation
   - Existing environment variable setup
3. Reuse existing architecture where it is good.
4. Do **NOT** blindly replace existing code.
5. Do **NOT** create duplicate API clients, stores, hooks, or authentication systems.
6. Make the smallest architectural changes necessary to achieve a clean production-level implementation.
7. Follow the existing project's coding conventions, naming conventions, folder structure, linting, formatting, and import style.

---

# Backend Login API

Login endpoint:

```text
POST http://localhost:3000/v1/users/auth/ib-login
```

Expected login request:

```json
{
  "email": "user1@user1.com",
  "password": "password"
}
```

Expected response:

```json
{
  "message": "IB Portal login successful",
  "portal": "IB_PORTAL",
  "user": {
    "id": 1,
    "email": "user1@user1.com",
    "firstName": "User1",
    "lastName": "User1",
    "phoneNumber": "1234567890",
    "fundsAvailable": "100000",
    "isVerified": true,
    "createdAt": "2026-09-09T12:53:49.852Z",
    "updatedAt": "2026-09-09T12:53:49.852Z",
    "passwordChangedAt": "2026-09-09T12:53:49.852Z"
  },
  "tokens": {
    "access": {
      "token": "ACCESS_TOKEN",
      "expires": "2026-09-10T19:10:11.044Z"
    },
    "refresh": {
      "token": "REFRESH_TOKEN",
      "expires": "2026-09-09T19:40:11.069Z"
    }
  }
}
```

The actual API response structure must be typed exactly and handled safely.

---

# Architecture

Implement a clean separation between:

1. API client
2. API endpoints
3. API types
4. Authentication API
5. Authentication service
6. Token handling
7. Token storage
8. Authentication state
9. API/server state
10. Error handling
11. Protected routes

Prefer this conceptual structure:

```text
src/
├── api/
│   ├── client.ts
│   ├── endpoints.ts
│   ├── api.types.ts
│   └── errors.ts
│
├── auth/
│   ├── auth.api.ts
│   ├── auth.service.ts
│   ├── auth.storage.ts
│   ├── auth.tokens.ts
│   └── auth.types.ts
│
├── features/
│   ├── auth/
│   │   ├── auth.store.ts
│   │   └── auth.hooks.ts
│   │
│   └── users/
│       ├── users.api.ts
│       ├── users.hooks.ts
│       └── users.types.ts
│
└── lib/
    └── query-client.ts
```

Adapt this structure to the project's existing architecture rather than forcing it.

---

# 1. API Client

Create or reuse a centralized Axios client.

Requirements:

- One shared Axios instance.
- Base URL must come from environment variables.
- Never hardcode the production API URL.
- Configure request timeout.
- Configure default JSON headers.
- Automatically attach:

```http
Authorization: Bearer <access_token>
```

to authenticated requests.

Example environment variable:

```env
VITE_API_BASE_URL=http://localhost:3000/v1
```

If the project uses Next.js, use the appropriate `NEXT_PUBLIC_*` variable instead.

If another environment system already exists, follow that system.

---

# 2. Request Interceptor

Implement an Axios request interceptor.

Responsibilities:

1. Retrieve the current access token.
2. Attach it to authenticated requests.
3. Avoid manually adding the token in individual API calls.
4. Do not log tokens.
5. Do not expose tokens through console logs.
6. Keep the interceptor lightweight.

Expected flow:

```text
API request
    ↓
Request interceptor
    ↓
Read access token
    ↓
Authorization: Bearer TOKEN
    ↓
Backend
```

---

# 3. JWT Token Handling

Create a dedicated token utility.

Use `jwt-decode` if appropriate.

The utility should support:

```ts
decode(token)
isExpired(token)
isValid(token)
getExpiration(token)
getUserId(token)
```

Use a small expiration buffer, approximately 30 seconds, when determining whether a token is about to expire.

Do **not** implement cryptographic JWT verification on the frontend.

The backend remains responsible for JWT validation.

---

# 4. Token Storage

Create one centralized abstraction for token storage.

Do **not** access `localStorage`/`sessionStorage` directly from random components.

For example:

```ts
authStorage.getAccessToken()
authStorage.getRefreshToken()

authStorage.setTokens(
  accessToken,
  refreshToken
)

authStorage.clearTokens()
```

If this is a browser dashboard, assess whether the current backend allows the refresh token to be stored in an HttpOnly Secure cookie.

If the backend already supports HttpOnly refresh cookies, prefer that architecture.

If it does not, implement the current API contract without breaking functionality, but clearly isolate storage so it can be migrated later.

Never store passwords.

Never log access or refresh tokens.

---

# 5. Refresh Token Flow

Implement automatic refresh handling.

Assume the refresh endpoint is:

```text
POST /users/auth/refresh
```

with:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Expected response:

```json
{
  "tokens": {
    "access": {
      "token": "NEW_ACCESS_TOKEN",
      "expires": "..."
    },
    "refresh": {
      "token": "NEW_REFRESH_TOKEN",
      "expires": "..."
    }
  }
}
```

## Important: Single-Flight Refresh

If multiple requests receive `401` at the same time:

```text
Request A → 401
Request B → 401
Request C → 401
Request D → 401
```

do **not** send four refresh requests.

Instead:

```text
Request A ─┐
Request B ─┤
Request C ─┼──→ ONE refresh request
Request D ─┘
                 ↓
            New token
                 ↓
       Retry failed requests
```

Use a shared `refreshPromise` or equivalent queue mechanism.

---

# 6. 401 Handling

Axios response interceptor should:

1. Detect HTTP 401.
2. Prevent infinite retry loops.
3. Attempt token refresh.
4. Save the new tokens.
5. Retry the original request exactly once.
6. If refresh fails:
   - Clear authentication tokens.
   - Clear authentication state.
   - Redirect the user to login.
7. Do not retry authentication/refresh endpoints recursively.

Use something like:

```ts
_retry?: boolean
```

on the request config or an equivalent mechanism.

Never create an infinite:

```text
401 → refresh → 401 → refresh → ...
```

loop.

---

# 7. Auth API

Create a dedicated authentication API module.

It should contain functions such as:

```ts
authApi.login()
authApi.refresh()
authApi.logout()
```

Login:

```ts
authApi.login({
  email,
  password
})
```

must call:

```text
POST /users/auth/ib-login
```

Do not call Axios directly from the login page.

---

# 8. Auth Service

Create an authentication service that orchestrates the complete authentication flow.

Example:

```ts
authService.login(credentials)
authService.logout()
```

Login should:

1. Call auth API.
2. Receive user and tokens.
3. Store tokens.
4. Update auth state.
5. Return the user/login response.

Logout should:

1. Attempt backend logout if supported.
2. Always clear local authentication state.
3. Clear stored tokens even if backend logout fails.

---

# 9. Auth Types

Create strict TypeScript interfaces/types for:

```ts
User
AuthToken
AuthTokens
LoginRequest
LoginResponse
RefreshTokenResponse
```

Use the backend response structure provided above.

Do **not** use `any` for API responses unless absolutely unavoidable.

---

# 10. Zustand

If Zustand already exists in the project, use it for client-side authentication state.

Authentication state should contain approximately:

```ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login(
    email: string,
    password: string
  ): Promise<void>;

  logout(): Promise<void>;

  initialize(): void;
}
```

Do not put all API/server data into Zustand.

Zustand should handle client-side state such as:

```text
Current authenticated user
Authentication status
Loading state
UI state
```

---

# 11. TanStack Query

If TanStack Query is already installed, use it for server/API state.

Use TanStack Query for:

```text
Users
Dashboard statistics
Transactions
Accounts
Orders
Funds
Notifications
Other API data
```

Do **not** duplicate server data unnecessarily in Zustand.

For example:

```ts
useCurrentUser()
useDashboard()
useTransactions()
```

should use TanStack Query where appropriate.

Configure:

- `staleTime`
- `gcTime`
- sensible retry behavior
- no retries for 401/403
- controlled refetch behavior

Do not over-fetch.

---

# 12. Query Invalidation

After mutations such as:

```text
Update profile
Change password
Create transaction
Update account
```

invalidate only the relevant queries.

Do **not** blindly invalidate the entire query cache after every mutation.

Example:

```ts
queryClient.invalidateQueries({
  queryKey: ['user', 'me'],
});
```

---

# 13. Error Handling

Create a centralized API error normalization system.

Handle:

```text
400 → Bad request
401 → Unauthorized
403 → Forbidden
404 → Not found
409 → Conflict
422 → Validation error
429 → Rate limited
500 → Server error
502/503/504 → Server unavailable
Network error → No response
Timeout → Request timeout
```

Expose a predictable application-level error format.

For example:

```ts
interface AppError {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}
```

The UI should not have to understand Axios's internal error structure.

---

# 14. Login UI Integration

Find the existing login page/form.

Do **not** create a second login page.

Connect the existing login form to:

```ts
authStore.login(email, password)
```

Handle:

```text
Loading
Success
Invalid credentials
Validation errors
Network errors
Server errors
```

Prevent duplicate login submissions while a login request is in progress.

After successful login, navigate to the existing dashboard route.

Use the project's existing router/navigation system.

---

# 15. Protected Routes

Find the existing routing system.

Implement or reuse a protected route mechanism.

Authenticated pages should require:

```ts
isAuthenticated === true
```

Unauthenticated users should be redirected to the login page.

Avoid redirect flickering during authentication initialization.

Correct flow:

```text
Application starts
      ↓
Initialize auth
      ↓
Check stored session
      ↓
Loading
      ↓
Authenticated?
   ↙          ↘
 YES           NO
 ↓             ↓
Dashboard     Login
```

---

# 16. Auth Initialization

On application startup:

1. Check whether authentication tokens exist.
2. Validate whether the access token is expired.
3. If access token is valid, restore authenticated state.
4. If access token is expired but refresh token exists, attempt refresh.
5. If refresh fails, clear authentication.
6. Avoid rendering protected application routes before initialization completes.

---

# 17. Security Requirements

Follow these rules:

- Never log JWTs.
- Never log passwords.
- Never put passwords in URL parameters.
- Never put access tokens in URLs.
- Never commit tokens/secrets to Git.
- Use environment variables for API URLs.
- Do not expose unnecessary JWT payload information to the UI.
- Never trust frontend JWT claims for authorization.
- Backend remains the source of truth for authorization.
- Prevent infinite refresh loops.
- Prevent concurrent refresh requests.
- Clear tokens on logout.
- Clear tokens when refresh fails.
- Do not silently swallow important API errors.

---

# 18. Performance Requirements

The implementation should be optimized for a production dashboard.

Avoid:

- Creating Axios instances repeatedly.
- Reading storage unnecessarily.
- Duplicate API calls.
- Duplicate refresh requests.
- Storing server state redundantly in Zustand.
- Global query invalidation after every mutation.
- Excessive refetching.
- Unnecessary React re-renders.

Use:

- Singleton Axios client.
- Shared refresh promise.
- TanStack Query caching.
- Stable query keys.
- Selective invalidation.
- Zustand selectors.

For example, prefer:

```ts
const isAuthenticated = useAuthStore(
  state => state.isAuthenticated
);
```

instead of subscribing to the entire store when unnecessary.

---

# 19. API Module Pattern

For future endpoints, establish this pattern:

```text
feature/
├── feature.api.ts
├── feature.hooks.ts
├── feature.types.ts
└── components/
```

Example:

`feature.api.ts`

contains API calls.

`feature.hooks.ts`

contains TanStack Query hooks.

`feature.types.ts`

contains feature-specific API types.

Components should consume hooks rather than directly calling Axios.

Example:

```tsx
const {
  data,
  isLoading,
  error
} = useDashboard();
```

instead of:

```tsx
axios.get(...)
```

inside components.

---

# 20. Environment Configuration

Create/update environment configuration appropriately.

Development:

```env
VITE_API_BASE_URL=http://localhost:3000/v1
```

Production should use a production API URL.

Do not hardcode:

```text
http://localhost:3000
```

inside API files.

Also inspect `.gitignore` and ensure environment files containing secrets are not accidentally committed.

---

# 21. Do Not Modify Backend

For this task, modify only the frontend unless a backend change is absolutely required for the existing API contract.

Do not change the backend API response structure.

If something required by the production architecture is missing from the backend, document it separately rather than inventing a frontend workaround.

---

# 22. Testing

After implementation, test:

## Login

```text
Login
 ↓
POST /users/auth/ib-login
 ↓
Tokens stored
 ↓
User stored
 ↓
Dashboard
```

## Authenticated API

```text
Dashboard request
 ↓
Authorization header
 ↓
200
```

## Expired Access Token

```text
Request
 ↓
401
 ↓
Refresh
 ↓
New access token
 ↓
Retry request
 ↓
200
```

## Concurrent Requests

Simulate multiple API requests when access token is expired.

Verify that only **ONE** refresh request is made.

## Expired Refresh Token

```text
Request
 ↓
401
 ↓
Refresh fails
 ↓
Clear tokens
 ↓
Clear auth state
 ↓
Redirect login
```

## Logout

Verify:

```text
Backend logout
 ↓
Tokens cleared
 ↓
Auth state cleared
 ↓
Protected route inaccessible
```

## Page Refresh

Refresh the browser while logged in.

Verify that authentication is restored correctly without unnecessary login.

---

# 23. Cleanup

After implementation:

1. Search the project for direct Axios/fetch calls.
2. Identify authentication-related API calls outside the new architecture.
3. Migrate them where appropriate.
4. Search for direct `localStorage` access related to authentication.
5. Move those accesses behind `authStorage`.
6. Remove duplicate API clients.
7. Remove duplicate authentication code.
8. Remove unused imports.
9. Run TypeScript checks.
10. Run ESLint.
11. Run tests if available.
12. Fix all errors introduced by the implementation.

Do **not** delete unrelated existing functionality.

---

# 24. Final Report

When finished, provide me with:

## Files Created

```text
/path/file.ts
/path/file.ts
...
```

## Files Modified

```text
/path/file.ts
...
```

## Authentication Flow

Explain:

```text
Login
Token storage
JWT attachment
Refresh
401 handling
Logout
Protected routes
```

## Packages Added

List all packages installed.

## Environment Variables

Tell me exactly which `.env` variables are required.

## Backend Assumptions

List any assumptions made about:

```text
refresh endpoint
logout endpoint
cookies
CORS
token expiration
```

## Testing

Tell me which flows you actually tested and whether they passed.

## Remaining Recommendations

Only mention genuinely useful production improvements.

---

# Most Important Implementation Rule

Do not just create the files described above.

First understand the existing application and integrate this architecture into it.

**Reuse existing good code.**

**Do not duplicate functionality.**

**Do not break existing UI, routing, styling, or business logic.**

The final result should feel like it was originally designed as part of the application, not bolted onto it.

Implement the changes directly in the existing frontend codebase.
